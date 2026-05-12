import type { UpscaleOptions, TileInfo } from './types';

function getOptimalTileSize(
  scale: number,
  imgW: number,
  imgH: number,
): number {
  const baseSize = scale === 4 ? 128 : 256;
  // Don't use tiles larger than the image
  return Math.min(baseSize, imgW, imgH);
}

function computeTiles(
  imgW: number,
  imgH: number,
  tileSize: number,
  overlap: number,
): TileInfo[] {
  const tiles: TileInfo[] = [];
  const step = tileSize - overlap;

  for (let y = 0; y < imgH; y += step) {
    for (let x = 0; x < imgW; x += step) {
      const padX = Math.max(0, x - overlap);
      const padY = Math.max(0, y - overlap);
      const padW = Math.min(tileSize + overlap * 2, imgW - padX);
      const padH = Math.min(tileSize + overlap * 2, imgH - padY);

      tiles.push({
        srcX: x, srcY: y,
        srcW: Math.min(tileSize, imgW - x),
        srcH: Math.min(tileSize, imgH - y),
        padX, padY, padW, padH,
      });
    }
  }

  return tiles;
}

function imageToTensor(
  ort: any,
  data: Uint8ClampedArray,
  w: number,
  h: number,
): { tensor: any; alpha: Uint8ClampedArray } {
  const planeSize = h * w;
  const float32 = new Float32Array(3 * planeSize);
  const alpha = new Uint8ClampedArray(planeSize);

  for (let i = 0; i < planeSize; i++) {
    float32[i] = data[i * 4] / 255.0;
    float32[planeSize + i] = data[i * 4 + 1] / 255.0;
    float32[2 * planeSize + i] = data[i * 4 + 2] / 255.0;
    alpha[i] = data[i * 4 + 3];
  }

  return {
    tensor: new ort.Tensor('float32', float32, [1, 3, h, w]),
    alpha,
  };
}

function tensorToImageData(
  tensorData: Float32Array,
  outW: number,
  outH: number,
  alpha: Uint8ClampedArray | null,
  alphaW: number,
  alphaH: number,
): ImageData {
  const planeSize = outH * outW;
  const rgba = new Uint8ClampedArray(planeSize * 4);

  for (let i = 0; i < planeSize; i++) {
    rgba[i * 4] = Math.round(Math.min(1, Math.max(0, tensorData[i])) * 255);
    rgba[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, tensorData[planeSize + i])) * 255);
    rgba[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, tensorData[2 * planeSize + i])) * 255);

    // Map alpha from input coordinates to output coordinates
    if (alpha) {
      const srcX = Math.floor((i % outW) / outW * alphaW);
      const srcY = Math.floor(Math.floor(i / outW) / outH * alphaH);
      const srcIdx = srcY * alphaW + srcX;
      rgba[i * 4 + 3] = alpha[Math.min(srcIdx, alpha.length - 1)];
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  return new ImageData(rgba, outW, outH);
}

export async function processWithTiling(
  session: any,
  ort: any,
  imageData: ImageData,
  options: UpscaleOptions,
): Promise<ImageData> {
  const { width: imgW, height: imgH, data: imgData } = imageData;
  const scale = options.scale;
  const overlap = options.overlap ?? 16;
  const tileSize = options.tileSize ?? getOptimalTileSize(scale, imgW, imgH);

  // If image is small enough, process without tiling
  if (imgW <= tileSize && imgH <= tileSize) {
    options.onProgress?.({ phase: 'preprocessing', detail: '处理中...', percent: 0 });
    const { tensor, alpha } = imageToTensor(ort, imgData, imgW, imgH);
    const feeds: Record<string, any> = {};
    const inputNames = session.inputNames || ['input'];
    feeds[inputNames[0]] = tensor;

    options.onProgress?.({ phase: 'inferring', detail: 'AI 处理中...', percent: 50 });
    const results = await session.run(feeds);
    const outputTensor = results[Object.keys(results)[0]];
    const outData = outputTensor.data as Float32Array;
    const outW = imgW * scale;
    const outH = imgH * scale;

    const result = tensorToImageData(outData, outW, outH, alpha, imgW, imgH);
    tensor.dispose?.();
    outputTensor.dispose?.();

    options.onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
    return result;
  }

  // Tiled processing
  const tiles = computeTiles(imgW, imgH, tileSize, overlap);
  const outW = imgW * scale;
  const outH = imgH * scale;

  // Create output canvas for stitching
  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d')!;

  // Create weight canvas for alpha blending
  const weightCanvas = document.createElement('canvas');
  weightCanvas.width = outW;
  weightCanvas.height = outH;
  const weightCtx = weightCanvas.getContext('2d')!;

  options.onProgress?.({ phase: 'preprocessing', detail: `处理 ${tiles.length} 个图块...`, percent: 0 });

  const inputNames = session.inputNames || ['input'];

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    options.onProgress?.({
      phase: 'inferring',
      detail: `处理图块 ${i + 1}/${tiles.length}`,
      percent: Math.round(((i + 1) / tiles.length) * 100),
    });

    // Extract tile pixels from source image
    const tileData = new Uint8ClampedArray(tile.padW * tile.padH * 4);
    for (let ty = 0; ty < tile.padH; ty++) {
      const srcRow = (tile.padY + ty) * imgW + tile.padX;
      const dstRow = ty * tile.padW;
      for (let tx = 0; tx < tile.padW; tx++) {
        const si = (srcRow + tx) * 4;
        const di = (dstRow + tx) * 4;
        tileData[di] = imgData[si];
        tileData[di + 1] = imgData[si + 1];
        tileData[di + 2] = imgData[si + 2];
        tileData[di + 3] = imgData[si + 3];
      }
    }

    const { tensor, alpha } = imageToTensor(ort, tileData, tile.padW, tile.padH);
    const feeds: Record<string, any> = {};
    feeds[inputNames[0]] = tensor;

    const results = await session.run(feeds);
    const outputTensor = results[Object.keys(results)[0]];
    const outData = outputTensor.data as Float32Array;

    const tileOutW = tile.padW * scale;
    const tileOutH = tile.padH * scale;

    // Convert tile output to ImageData
    const tileResult = tensorToImageData(outData, tileOutW, tileOutH, alpha, tile.padW, tile.padH);

    // Compute the region in the output image that this tile covers
    const outX = tile.srcX * scale;
    const outY = tile.srcY * scale;
    const outTileW = tile.srcW * scale;
    const outTileH = tile.srcH * scale;

    // Compute the crop region within the tile output (remove overlap padding)
    const cropX = (tile.srcX - tile.padX) * scale;
    const cropY = (tile.srcY - tile.padY) * scale;

    // Create a temporary canvas for this tile with blending weights
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileOutW;
    tileCanvas.height = tileOutH;
    const tileCtx = tileCanvas.getContext('2d')!;
    tileCtx.putImageData(tileResult, 0, 0);

    // Create weight map for this tile (ramp from 0 at edges to 1 in center)
    const weightMapCanvas = document.createElement('canvas');
    weightMapCanvas.width = tileOutW;
    weightMapCanvas.height = tileOutH;
    const wCtx = weightMapCanvas.getContext('2d')!;

    // Fill with 1 (full weight)
    wCtx.fillStyle = 'white';
    wCtx.fillRect(0, 0, tileOutW, tileOutH);

    // Create edge ramps
    const rampSize = overlap * scale;
    if (rampSize > 0) {
      // Left ramp
      if (tile.padX < tile.srcX) {
        const grad = wCtx.createLinearGradient(0, 0, rampSize, 0);
        grad.addColorStop(0, 'black');
        grad.addColorStop(1, 'white');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, 0, rampSize, tileOutH);
      }
      // Top ramp
      if (tile.padY < tile.srcY) {
        const grad = wCtx.createLinearGradient(0, 0, 0, rampSize);
        grad.addColorStop(0, 'black');
        grad.addColorStop(1, 'white');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, 0, tileOutW, rampSize);
      }
      // Right ramp
      if (tile.padX + tile.padW > tile.srcX + tile.srcW) {
        const grad = wCtx.createLinearGradient(tileOutW - rampSize, 0, tileOutW, 0);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, 'black');
        wCtx.fillStyle = grad;
        wCtx.fillRect(tileOutW - rampSize, 0, rampSize, tileOutH);
      }
      // Bottom ramp
      if (tile.padY + tile.padH > tile.srcY + tile.srcH) {
        const grad = wCtx.createLinearGradient(0, tileOutH - rampSize, 0, tileOutH);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, 'black');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, tileOutH - rampSize, tileOutW, rampSize);
      }
    }

    // Stamp tile onto output using weighted blending
    // We use composite operations: multiply tile by weight, add to output
    const croppedTile = document.createElement('canvas');
    croppedTile.width = outTileW;
    croppedTile.height = outTileH;
    const ctCtx = croppedTile.getContext('2d')!;
    ctCtx.drawImage(tileCanvas, cropX, cropY, outTileW, outTileH, 0, 0, outTileW, outTileH);

    const croppedWeight = document.createElement('canvas');
    croppedWeight.width = outTileW;
    croppedWeight.height = outTileH;
    const cwCtx = croppedWeight.getContext('2d')!;
    cwCtx.drawImage(weightMapCanvas, cropX, cropY, outTileW, outTileH, 0, 0, outTileW, outTileH);

    // For blending: read existing pixels before writing new tile
    const tilePixels = ctCtx.getImageData(0, 0, outTileW, outTileH);
    const weightPixels = cwCtx.getImageData(0, 0, outTileW, outTileH);
    const existingPixels = outCtx.getImageData(outX, outY, outTileW, outTileH);
    const existingWeight = weightCtx.getImageData(outX, outY, outTileW, outTileH);

    for (let p = 0; p < tilePixels.data.length; p += 4) {
      const w = weightPixels.data[p] / 255; // Use red channel as weight
      const ew = existingWeight.data[p] / 255;
      const totalW = w + ew;

      if (totalW > 0) {
        const nw = w / totalW;
        existingPixels.data[p] = Math.round(existingPixels.data[p] * (1 - nw) + tilePixels.data[p] * nw);
        existingPixels.data[p + 1] = Math.round(existingPixels.data[p + 1] * (1 - nw) + tilePixels.data[p + 1] * nw);
        existingPixels.data[p + 2] = Math.round(existingPixels.data[p + 2] * (1 - nw) + tilePixels.data[p + 2] * nw);
        existingPixels.data[p + 3] = Math.round(existingPixels.data[p + 3] * (1 - nw) + tilePixels.data[p + 3] * nw);
      }
      existingWeight.data[p] = Math.round(Math.max(w, ew) * 255);
      existingWeight.data[p + 1] = existingWeight.data[p];
      existingWeight.data[p + 2] = existingWeight.data[p];
      existingWeight.data[p + 3] = 255;
    }

    outCtx.putImageData(existingPixels, outX, outY);
    weightCtx.putImageData(existingWeight, outX, outY);

    tensor.dispose?.();
    outputTensor.dispose?.();

    // Yield to UI thread
    await new Promise(r => setTimeout(r, 0));
  }

  options.onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
  return outCtx.getImageData(0, 0, outW, outH);
}

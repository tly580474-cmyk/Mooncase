import type { Anime4kOptions, UpscaleProgress } from './types';

function boxBlurH(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
) {
  const div = 2 * radius + 1;
  for (let y = 0; y < h; y++) {
    let rSum = 0, gSum = 0, bSum = 0;
    const rowOff = y * w;
    // Init window
    for (let k = -radius; k <= radius; k++) {
      const x = Math.min(Math.max(k, 0), w - 1);
      const i = (rowOff + x) * 4;
      rSum += src[i]; gSum += src[i + 1]; bSum += src[i + 2];
    }
    for (let x = 0; x < w; x++) {
      const di = (rowOff + x) * 4;
      dst[di] = rSum / div;
      dst[di + 1] = gSum / div;
      dst[di + 2] = bSum / div;
      dst[di + 3] = src[di + 3];
      // Slide window
      const removeX = Math.max(x - radius, 0);
      const addX = Math.min(x + radius + 1, w - 1);
      const ri = (rowOff + removeX) * 4;
      const ai = (rowOff + addX) * 4;
      rSum += src[ai] - src[ri];
      gSum += src[ai + 1] - src[ri + 1];
      bSum += src[ai + 2] - src[ri + 2];
    }
  }
}

function boxBlurV(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
) {
  const div = 2 * radius + 1;
  for (let x = 0; x < w; x++) {
    let rSum = 0, gSum = 0, bSum = 0;
    // Init window
    for (let k = -radius; k <= radius; k++) {
      const y = Math.min(Math.max(k, 0), h - 1);
      const i = (y * w + x) * 4;
      rSum += src[i]; gSum += src[i + 1]; bSum += src[i + 2];
    }
    for (let y = 0; y < h; y++) {
      const di = (y * w + x) * 4;
      dst[di] = rSum / div;
      dst[di + 1] = gSum / div;
      dst[di + 2] = bSum / div;
      dst[di + 3] = src[di + 3];
      const removeY = Math.max(y - radius, 0);
      const addY = Math.min(y + radius + 1, h - 1);
      const ri = (removeY * w + x) * 4;
      const ai = (addY * w + x) * 4;
      rSum += src[ai] - src[ri];
      gSum += src[ai + 1] - src[ri + 1];
      bSum += src[ai + 2] - src[ri + 2];
    }
  }
}

function isHdrImage(data: Uint8ClampedArray): boolean {
  // Detect HDR by checking for unnatural highlight clustering at 255
  // If >5% of pixels are pure white (255,255,255), likely HDR tone-mapping clipping
  let maxCount = 0;
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] >= 250 && data[i + 1] >= 250 && data[i + 2] >= 250) {
      maxCount++;
    }
  }
  return maxCount / total > 0.05;
}

function applyHdrToneMap(data: Uint8ClampedArray) {
  // Soft highlight compression for HDR content
  // Preserves midtones and shadows, only compresses the top ~20% of the range
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = data[i + c];
      if (v > 200) {
        // Soft knee: compress 200-255 into 200-240 range
        const t = (v - 200) / 55; // 0..1
        const compressed = 200 + t * 40; // 200..240
        data[i + c] = Math.round(compressed);
      }
    }
  }
}

function applyUnsharpMask(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  amount: number,
) {
  const len = w * h * 4;
  const blur1 = new Uint8ClampedArray(len);
  const blur2 = new Uint8ClampedArray(len);
  const radius = 2;

  boxBlurH(data, blur1, w, h, radius);
  boxBlurV(blur1, blur2, w, h, radius);

  for (let i = 0; i < len; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + amount * (data[i] - blur2[i])));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount * (data[i + 1] - blur2[i + 1])));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount * (data[i + 2] - blur2[i + 2])));
  }
}

function buildContrastLut(level: number): Uint8Array {
  const k = 4 + level * 16; // level 0→k=4, level 1→k=20
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    const y = 1 / (1 + Math.exp(-k * (x - 0.5)));
    // Normalize to 0-255
    const yMin = 1 / (1 + Math.exp(k / 2));
    const yMax = 1 / (1 + Math.exp(-k / 2));
    lut[i] = Math.round(((y - yMin) / (yMax - yMin)) * 255);
  }
  return lut;
}

function applyContrastLut(data: Uint8ClampedArray, lut: Uint8Array) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
}

function applyMedianFilter(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const di = (y * w + x) * 4;
      // Compute local variance to detect edges
      let lumSum = 0, lumSqSum = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = Math.min(Math.max(y + dy, 0), h - 1);
          const nx = Math.min(Math.max(x + dx, 0), w - 1);
          const ni = (ny * w + nx) * 4;
          const lum = src[ni] * 0.299 + src[ni + 1] * 0.587 + src[ni + 2] * 0.114;
          lumSum += lum;
          lumSqSum += lum * lum;
          count++;
        }
      }
      const mean = lumSum / count;
      const variance = lumSqSum / count - mean * mean;

      // High variance = edge, skip median (preserve edges)
      if (variance > 400) {
        dst[di] = src[di];
        dst[di + 1] = src[di + 1];
        dst[di + 2] = src[di + 2];
        dst[di + 3] = src[di + 3];
        continue;
      }

      // Collect 3x3 neighborhood luminance values and find median
      const vals: number[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = Math.min(Math.max(y + dy, 0), h - 1);
          const nx = Math.min(Math.max(x + dx, 0), w - 1);
          const ni = (ny * w + nx) * 4;
          vals.push(src[ni] * 0.299 + src[ni + 1] * 0.587 + src[ni + 2] * 0.114);
        }
      }
      vals.sort((a, b) => a - b);
      const medianLum = vals[4];
      const curLum = src[di] * 0.299 + src[di + 1] * 0.587 + src[di + 2] * 0.114;
      const diff = medianLum - curLum;

      dst[di] = Math.min(255, Math.max(0, src[di] + diff));
      dst[di + 1] = Math.min(255, Math.max(0, src[di + 1] + diff));
      dst[di + 2] = Math.min(255, Math.max(0, src[di + 2] + diff));
      dst[di + 3] = src[di + 3];
    }
  }
}

function processImageData(
  imageData: ImageData,
  sharpenStrength: number,
  contrastLevel: number,
  isHdr: boolean,
  onProgress?: (p: UpscaleProgress) => void,
): ImageData {
  const { width: w, height: h, data } = imageData;

  // Tone map HDR highlights before processing
  if (isHdr) {
    applyHdrToneMap(data);
  }

  onProgress?.({ phase: 'inferring', detail: '边缘增强...', percent: 50 });
  // Reduce sharpening strength for HDR to avoid amplifying clipped highlights
  applyUnsharpMask(data, w, h, isHdr ? sharpenStrength * 0.6 : sharpenStrength);

  onProgress?.({ phase: 'inferring', detail: '对比度增强...', percent: 75 });
  // Use softer contrast for HDR to preserve highlight detail
  const effectiveContrast = isHdr ? contrastLevel * 0.5 : contrastLevel;
  const lut = buildContrastLut(effectiveContrast);
  applyContrastLut(data, lut);

  onProgress?.({ phase: 'inferring', detail: '去除噪点...', percent: 90 });
  const denoised = new Uint8ClampedArray(data.length);
  applyMedianFilter(data, denoised, w, h);
  data.set(denoised);

  return imageData;
}

const TILE_SIZE = 2048;
const TILE_OVERLAP = 8;
const MEGA_PIXEL_THRESHOLD = 16 * 1024 * 1024; // 16 megapixels

interface TileRect {
  x: number; y: number; w: number; h: number;
  srcX: number; srcY: number; srcW: number; srcH: number;
}

function computeA4kTiles(outW: number, outH: number): TileRect[] {
  if (outW * outH <= MEGA_PIXEL_THRESHOLD) {
    return [{ x: 0, y: 0, w: outW, h: outH, srcX: 0, srcY: 0, srcW: outW, srcH: outH }];
  }
  const tiles: TileRect[] = [];
  const step = TILE_SIZE - TILE_OVERLAP;
  for (let y = 0; y < outH; y += step) {
    for (let x = 0; x < outW; x += step) {
      const padX = Math.max(0, x - TILE_OVERLAP);
      const padY = Math.max(0, y - TILE_OVERLAP);
      const padW = Math.min(TILE_SIZE + TILE_OVERLAP * 2, outW - padX);
      const padH = Math.min(TILE_SIZE + TILE_OVERLAP * 2, outH - padY);
      const srcW = Math.min(TILE_SIZE, outW - x);
      const srcH = Math.min(TILE_SIZE, outH - y);
      tiles.push({ x: padX, y: padY, w: padW, h: padH, srcX: x, srcY: y, srcW, srcH });
    }
  }
  return tiles;
}

export async function runAnime4kUpscale(
  imageData: ImageData,
  options: Anime4kOptions,
): Promise<ImageData> {
  const { scale, onProgress } = options;
  const sharpenStrength = options.sharpenStrength ?? 1.0;
  const contrastLevel = options.contrastLevel ?? 0.5;
  const srcW = imageData.width;
  const srcH = imageData.height;
  const outW = srcW * scale;
  const outH = srcH * scale;

  // Stage 1: Bicubic upscale
  onProgress?.({ phase: 'preprocessing', detail: '双三次插值放大...', percent: 10 });

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  srcCanvas.getContext('2d')!.putImageData(imageData, 0, 0);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(srcCanvas, 0, 0, outW, outH);

  onProgress?.({ phase: 'preprocessing', detail: '双三次插值放大...', percent: 20 });

  // Detect HDR content for adaptive processing
  const hdr = isHdrImage(imageData.data);

  // Stage 2-4: Process with tiling if needed
  const tiles = computeA4kTiles(outW, outH);

  if (tiles.length === 1) {
    // Small image: process directly
    const result = outCtx.getImageData(0, 0, outW, outH);
    processImageData(result, sharpenStrength, contrastLevel, hdr, onProgress);
    onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
    return result;
  }

  // Large image: tile processing
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = outW;
  finalCanvas.height = outH;
  const finalCtx = finalCanvas.getContext('2d')!;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    onProgress?.({
      phase: 'inferring',
      detail: `处理图块 ${i + 1}/${tiles.length}`,
      percent: Math.round(20 + (i / tiles.length) * 70),
    });

    const tileData = outCtx.getImageData(tile.x, tile.y, tile.w, tile.h);
    processImageData(tileData, sharpenStrength, contrastLevel, hdr);

    // Place back, cropping overlap
    const cropX = tile.srcX - tile.x;
    const cropY = tile.srcY - tile.y;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = tile.w;
    tmpCanvas.height = tile.h;
    tmpCanvas.getContext('2d')!.putImageData(tileData, 0, 0);

    finalCtx.drawImage(
      tmpCanvas,
      cropX, cropY, tile.srcW, tile.srcH,
      tile.srcX, tile.srcY, tile.srcW, tile.srcH,
    );

    // Yield to UI thread
    await new Promise(r => setTimeout(r, 0));
  }

  onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
  return finalCtx.getImageData(0, 0, outW, outH);
}

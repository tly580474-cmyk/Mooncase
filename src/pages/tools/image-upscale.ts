import { icon } from '../../core/icons';
import type { ScaleFactor, InferenceBackend, UpscaleProgress } from '../../core/upscaler/types';

let activeAbortController: AbortController | null = null;

export default {
  id: 'image-upscale',
  name: 'AI图片超分辨率',
  icon: 'wand',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/image" class="tool-page-back">${icon('image')} 图片工具</a>
          <h1 style="font: var(--text-headline-md);">AI 图片超分辨率</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">基于 Real-ESRGAN 的 AI 图片无损放大，所有处理在本地完成</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <div id="up-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 48px; text-align: center; cursor: pointer;">
              <div style="color: var(--color-on-surface-variant); margin-bottom: 12px;">${icon('upload', 36)}</div>
              <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
              <p style="font: var(--text-label-md); color: var(--color-outline); margin-top: 8px;">支持 JPG / PNG / WebP</p>
              <input type="file" id="up-file" accept="image/*" style="display: none;" />
            </div>
          </div>

          <div id="up-controls" style="display: none;">
            <div style="display: flex; flex-wrap: wrap; gap: 16px;">
              <div class="tool-field" style="flex: 1; min-width: 120px;">
                <label class="tool-label">放大倍数</label>
                <div style="display: flex; gap: 8px;">
                  <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                    <input type="radio" name="up-scale" value="2" checked style="accent-color: var(--color-primary);" />
                    2X
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                    <input type="radio" name="up-scale" value="4" style="accent-color: var(--color-primary);" />
                    4X
                  </label>
                </div>
              </div>

              <div class="tool-field" style="flex: 1; min-width: 120px;">
                <label class="tool-label">推理后端</label>
                <select id="up-backend" class="tool-input">
                  <option value="webgpu">WebGPU (最快)</option>
                  <option value="webgl" selected>WebGL</option>
                  <option value="wasm">WASM (兼容)</option>
                </select>
              </div>
            </div>

            <div id="up-preview-area" style="text-align: center; padding: 16px 0;">
              <img id="up-preview" style="max-width: 100%; max-height: 300px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant);" />
              <p id="up-dims" style="font: var(--text-label-md); color: var(--color-on-surface-variant); margin-top: 8px;"></p>
            </div>

            <div class="tool-actions" style="justify-content: center;">
              <button class="btn btn-primary" id="up-start">${icon('wand')} 开始放大</button>
            </div>
          </div>

          <div id="up-progress" style="display: none; margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span id="up-status" style="font: var(--text-body-sm); color: var(--color-on-surface-variant);">准备中...</span>
              <span id="up-percent" style="font: var(--text-label-md); color: var(--color-primary);">0%</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--color-surface-variant); border-radius: 3px; overflow: hidden;">
              <div id="up-progress-bar" style="width: 0%; height: 100%; background: var(--color-primary); transition: width 0.3s; border-radius: 3px;"></div>
            </div>
          </div>

          <div id="up-result" style="display: none;">
            <div id="up-compare" style="position: relative; overflow: hidden; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); cursor: ew-resize; user-select: none;">
              <img id="up-after" style="display: block; width: 100%;" />
              <div id="up-before-wrap" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;">
                <img id="up-before" style="display: block; width: 100%;" />
              </div>
              <div id="up-handle" style="position: absolute; top: 0; bottom: 0; left: 50%; width: 3px; background: white; cursor: ew-resize; box-shadow: 0 0 8px rgba(0,0,0,0.4); z-index: 10;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; border-radius: 50%; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/></svg>
                </div>
              </div>
              <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 12px; z-index: 5;">原图</span>
              <span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 12px; z-index: 5;">放大后</span>
            </div>

            <div id="up-result-info" style="display: flex; justify-content: center; gap: 24px; margin: 16px 0;">
              <div style="text-align: center;">
                <div style="font: var(--text-label-md); color: var(--color-on-surface-variant);">原图</div>
                <div id="up-orig-size" style="font: var(--text-body-md);"></div>
              </div>
              <div style="text-align: center; color: var(--color-primary); font-size: 20px; align-self: center;">→</div>
              <div style="text-align: center;">
                <div style="font: var(--text-label-md); color: var(--color-on-surface-variant);">放大后</div>
                <div id="up-result-size" style="font: var(--text-body-md);"></div>
              </div>
            </div>

            <div class="tool-actions" style="justify-content: center;">
              <button class="btn btn-primary" id="up-download">${icon('download')} 下载放大图片</button>
              <button class="btn btn-ghost" id="up-reset">${icon('refresh')} 重新选择</button>
            </div>
          </div>

          <div id="up-error" style="display: none; padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); margin-top: 16px;">
            <p id="up-error-text" style="color: #ef4444; font: var(--text-body-sm);"></p>
          </div>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#up-dropzone') as HTMLElement;
    const fileInput = container.querySelector('#up-file') as HTMLInputElement;
    const controls = container.querySelector('#up-controls') as HTMLElement;
    const preview = container.querySelector('#up-preview') as HTMLImageElement;
    const dimsEl = container.querySelector('#up-dims') as HTMLElement;
    const progressArea = container.querySelector('#up-progress') as HTMLElement;
    const statusBar = container.querySelector('#up-status') as HTMLElement;
    const percentEl = container.querySelector('#up-percent') as HTMLElement;
    const progressBar = container.querySelector('#up-progress-bar') as HTMLElement;
    const resultArea = container.querySelector('#up-result') as HTMLElement;
    const errorArea = container.querySelector('#up-error') as HTMLElement;
    const errorText = container.querySelector('#up-error-text') as HTMLElement;

    if (activeAbortController) activeAbortController.abort();
    const abortController = new AbortController();
    activeAbortController = abortController;
    const signal = abortController.signal;

    let currentFile: File | null = null;
    let currentUrl: string | null = null;
    let currentOrigUrl: string | null = null;
    let resultBlob: Blob | null = null;
    let resultUrl: string | null = null;

    function showFile(file: File) {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      if (currentOrigUrl) { URL.revokeObjectURL(currentOrigUrl); currentOrigUrl = null; }
      currentFile = file;
      currentUrl = URL.createObjectURL(file);
      preview.onload = () => {
        dimsEl.textContent = `${preview.naturalWidth} × ${preview.naturalHeight} 像素`;
      };
      preview.src = currentUrl;

      controls.style.display = 'block';
      resultArea.style.display = 'none';
      progressArea.style.display = 'none';
      errorArea.style.display = 'none';
    }

    dropzone.addEventListener('click', () => fileInput.click(), { signal });
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-primary)'; }, { signal });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--color-outline-variant)'; }, { signal });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-outline-variant)';
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) showFile(file);
    }, { signal });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) showFile(file);
    }, { signal });

    document.addEventListener('paste', (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) showFile(blob);
          break;
        }
      }
    }, { signal });

    // Detect backends
    (async () => {
      try {
        const { detectBackends } = await import('../../core/upscaler/engine');
        const available = await detectBackends();
        const backendSelect = container.querySelector('#up-backend') as HTMLSelectElement;
        // Enable available backends, mark best as default
        for (const opt of Array.from(backendSelect.options)) {
          const isAvailable = available.includes(opt.value as InferenceBackend);
          opt.disabled = !isAvailable;
          if (!isAvailable) opt.textContent += ' (不可用)';
        }
        backendSelect.value = available[0];
      } catch {}
    })();

    // Start upscale
    container.querySelector('#up-start')!.addEventListener('click', async () => {
      if (!currentFile) return;

      const scale = parseInt((container.querySelector('input[name="up-scale"]:checked') as HTMLInputElement).value) as ScaleFactor;
      const backend = (container.querySelector('#up-backend') as HTMLSelectElement).value as InferenceBackend;
      const startBtn = container.querySelector('#up-start') as HTMLButtonElement;

      startBtn.disabled = true;

      progressArea.style.display = 'block';
      resultArea.style.display = 'none';
      errorArea.style.display = 'none';

      try {
        const { runUpscale } = await import('../../core/upscaler/engine');

        // Load source image
        const srcImg = new Image();
        const srcUrl = URL.createObjectURL(currentFile);
        await new Promise<void>((resolve, reject) => {
          srcImg.onload = () => resolve();
          srcImg.onerror = () => reject(new Error('图片加载失败'));
          srcImg.src = srcUrl;
        });

        // Validate image dimensions (BUG-07)
        const MAX_DIMENSION = 8192;
        const outW = srcImg.width * scale;
        const outH = srcImg.height * scale;
        if (outW > MAX_DIMENSION || outH > MAX_DIMENSION) {
          throw new Error(`放大后图片尺寸 ${outW}×${outH} 超过限制 ${MAX_DIMENSION}×${MAX_DIMENSION}，请选择更小的图片或降低放大倍数`);
        }

        // Draw to canvas to get ImageData
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = srcImg.width;
        srcCanvas.height = srcImg.height;
        const srcCtx = srcCanvas.getContext('2d')!;
        srcCtx.drawImage(srcImg, 0, 0);
        const srcData = srcCtx.getImageData(0, 0, srcImg.width, srcImg.height);
        URL.revokeObjectURL(srcUrl);

        const onProgress = (p: UpscaleProgress) => {
          statusBar.textContent = p.detail || p.phase;
          if (p.percent !== undefined) {
            percentEl.textContent = p.percent + '%';
            progressBar.style.width = p.percent + '%';
          }
        };

        const result = await runUpscale(srcData, { scale, backend, onProgress });

        // Convert result to canvas and blob
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = result.width;
        resultCanvas.height = result.height;
        resultCanvas.getContext('2d')!.putImageData(result, 0, 0);

        try {
          resultCanvas.toBlob((blob) => {
            if (!blob) return;
            resultBlob = blob;

            // Set up comparison
            const beforeImg = container.querySelector('#up-before') as HTMLImageElement;
            const afterImg = container.querySelector('#up-after') as HTMLImageElement;

            if (currentOrigUrl) URL.revokeObjectURL(currentOrigUrl);
            currentOrigUrl = URL.createObjectURL(currentFile!);
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            resultUrl = URL.createObjectURL(blob);

            beforeImg.src = currentOrigUrl;
            afterImg.src = resultUrl;

            container.querySelector('#up-orig-size')!.textContent = `${srcImg.width} × ${srcImg.height}`;
            container.querySelector('#up-result-size')!.textContent = `${result.width} × ${result.height}`;

            progressArea.style.display = 'none';
            resultArea.style.display = 'block';
            setupCompareSlider();

            // Cleanup blob URL after image loads
            setTimeout(() => {
              if (currentOrigUrl) { URL.revokeObjectURL(currentOrigUrl); currentOrigUrl = null; }
            }, 1000);
          }, 'image/png');
        } catch {
          throw new Error('图片处理失败，可能是安全限制导致');
        }

      } catch (err: any) {
        errorArea.style.display = 'block';
        errorText.textContent = err.message || String(err);
      } finally {
        startBtn.disabled = false;
      }
    });

    // Download
    container.querySelector('#up-download')!.addEventListener('click', () => {
      if (!resultBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(resultBlob);
      a.download = `upscaled-${currentFile?.name || 'image'}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, { signal });

    // Reset
    container.querySelector('#up-reset')!.addEventListener('click', () => {
      resultArea.style.display = 'none';
      progressArea.style.display = 'none';
      errorArea.style.display = 'none';
      resultBlob = null;
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        resultUrl = null;
      }
      if (currentOrigUrl) {
        URL.revokeObjectURL(currentOrigUrl);
        currentOrigUrl = null;
      }
    }, { signal });

    // Compare slider
    function setupCompareSlider() {
      const compareEl = container.querySelector('#up-compare') as HTMLElement;
      const beforeWrap = container.querySelector('#up-before-wrap') as HTMLElement;
      const handleEl = container.querySelector('#up-handle') as HTMLElement;
      let isDragging = false;

      function updateSlider(clientX: number) {
        const rect = compareEl.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = (x / rect.width) * 100;
        beforeWrap.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handleEl.style.left = `${pct}%`;
      }

      compareEl.addEventListener('mousedown', (e) => { isDragging = true; updateSlider(e.clientX); e.preventDefault(); }, { signal });
      window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); }, { signal });
      window.addEventListener('mouseup', () => { isDragging = false; }, { signal });

      compareEl.addEventListener('touchstart', (e) => { isDragging = true; updateSlider(e.touches[0].clientX); }, { signal, passive: true });
      window.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches[0].clientX); }, { signal });
      window.addEventListener('touchend', () => { isDragging = false; }, { signal });
    }
  },
  destroy() {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    import('../../core/upscaler/engine').then(({ disposeEngine }) => disposeEngine());
  },
};

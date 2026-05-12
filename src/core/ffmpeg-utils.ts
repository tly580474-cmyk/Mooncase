import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoading = false;
let ffmpegReady = false;
let loadError: string | null = null;

const LOAD_TIMEOUT_MS = 60000;

const ST_BASE = '/ffmpeg/core';

async function fetchBlobUrls(base: string, needsWorker: boolean) {
  const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
  const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');
  const workerURL = needsWorker
    ? await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript')
    : undefined;
  return { coreURL, wasmURL, workerURL };
}

export async function getFFmpeg(onLog?: (msg: string) => void, onProgress?: (p: number) => void): Promise<FFmpeg> {
  if (ffmpegReady && ffmpegInstance) return ffmpegInstance;

  if (loadError) {
    loadError = null;
    ffmpegReady = false;
  }

  if (ffmpegLoading) {
    await new Promise<void>(resolve => {
      const check = setInterval(() => {
        if (ffmpegReady || !ffmpegLoading) { clearInterval(check); resolve(); }
      }, 200);
    });
    if (ffmpegInstance) return ffmpegInstance;
    if (loadError) throw new Error(loadError);
    throw new Error('FFmpeg 加载失败');
  }

  ffmpegLoading = true;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('FFmpeg 加载超时（60秒），请刷新页面重试')), LOAD_TIMEOUT_MS)
    );

    const loadSequence = (async () => {
      const { FFmpeg: FFmpegClass } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = new FFmpegClass();
      if (onLog) ffmpeg.on('log', ({ message }: { message: string }) => onLog(message));
      if (onProgress) ffmpeg.on('progress', ({ progress }: { progress: number }) => onProgress(progress));

      // 使用单线程核心（ST），避免 MT 核心的 pthread worker 创建失败导致编码卡死
      const { coreURL, wasmURL } = await fetchBlobUrls(ST_BASE, false);

      await ffmpeg.load({ coreURL, wasmURL });

      return ffmpeg;
    })();

    const ffmpeg = await Promise.race([loadSequence, timeoutPromise]);

    ffmpegInstance = ffmpeg;
    ffmpegReady = true;
    return ffmpeg;
  } catch (e: any) {
    const msg: string = e?.message || '';
    if (msg.includes('SharedArrayBuffer') || msg.includes('bad memory')) {
      loadError = '浏览器不支持 SharedArrayBuffer，请确认页面已启用跨域隔离（COOP/COEP 头）';
    } else if (!msg) {
      loadError = 'FFmpeg 加载失败，请刷新页面重试';
    } else {
      loadError = msg;
    }
    throw e;
  } finally {
    ffmpegLoading = false;
  }
}

export function terminateFFmpeg() {
  if (ffmpegInstance) {
    ffmpegInstance.terminate();
    ffmpegInstance = null;
  }
  ffmpegReady = false;
  ffmpegLoading = false;
  loadError = null;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `文件过大 (${formatSize(file.size)})，最大支持 10GB`;
  }
  return null;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

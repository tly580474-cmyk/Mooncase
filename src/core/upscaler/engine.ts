import type { UpscaleOptions, InferenceBackend, ScaleFactor, UpscaleProgress } from './types';
import { MODEL_URLS } from './types';

// Minimal IndexedDB wrapper for model caching
const DB_NAME = 'upscaler-models';
const DB_VERSION = 1;
const STORE_NAME = 'models';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedModel(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function cacheModel(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Caching is best-effort
  }
}

function getModelUrl(scale: ScaleFactor): string {
  return MODEL_URLS[scale];
}

function getExecutionProviders(backend: InferenceBackend): string[] {
  switch (backend) {
    case 'webgpu':
      return ['webgpu', 'wasm'];
    case 'webgl':
      return ['webgl', 'wasm'];
    case 'wasm':
    default:
      return ['wasm'];
  }
}

export async function detectBackends(): Promise<InferenceBackend[]> {
  const available: InferenceBackend[] = ['wasm'];

  // WebGL detection
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) available.unshift('webgl');
  } catch {}

  // WebGPU detection
  if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) available.unshift('webgpu');
    } catch {}
  }

  return available;
}

let ortModule: any = null;
let currentSession: any = null;
let currentModelKey = '';

async function getOrt() {
  if (!ortModule) {
    ortModule = await import('onnxruntime-web');
    // Use local WASM files to avoid COEP cross-origin issues
    ortModule.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
  }
  return ortModule;
}

async function loadModelBuffer(
  scale: ScaleFactor,
  onProgress?: (p: UpscaleProgress) => void,
): Promise<ArrayBuffer> {
  const url = getModelUrl(scale);
  const cacheKey = `esrgan-${scale}x`;

  // Try IndexedDB cache first
  const cached = await getCachedModel(cacheKey);
  if (cached) {
    onProgress?.({ phase: 'loading-model', detail: '从缓存加载模型...', percent: 90 });
    return cached;
  }

  onProgress?.({ phase: 'loading-model', detail: '下载模型中...', percent: 0 });

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`模型下载失败: ${resp.status}`);

  const contentLength = resp.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength) : 0;

  if (resp.body && total > 0) {
    const reader = resp.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress?.({
        phase: 'loading-model',
        detail: `下载中 ${(received / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB`,
        percent: Math.round((received / total) * 80),
      });
    }

    const buffer = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    onProgress?.({ phase: 'loading-model', detail: '缓存模型...', percent: 90 });
    await cacheModel(cacheKey, ab);
    return ab;
  }

  onProgress?.({ phase: 'loading-model', detail: '下载中...', percent: 50 });
  const buf = await resp.arrayBuffer();
  onProgress?.({ phase: 'loading-model', detail: '缓存模型...', percent: 90 });
  await cacheModel(cacheKey, buf);
  return buf;
}

async function createSessionWithFallback(
  modelBuffer: ArrayBuffer,
  preferredBackend: InferenceBackend,
  onProgress?: (p: UpscaleProgress) => void,
) {
  const ort = await getOrt();
  const providers = getExecutionProviders(preferredBackend);

  for (const provider of providers) {
    try {
      onProgress?.({ phase: 'loading-model', detail: `初始化 ${provider.toUpperCase()} 后端...`, percent: 95 });
      const session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: [provider],
        graphOptimizationLevel: 'all',
      });
      return { session, backend: provider as InferenceBackend };
    } catch {
      // Try next provider
    }
  }
  throw new Error('所有推理后端均初始化失败');
}

export async function runUpscale(
  imageData: ImageData,
  options: UpscaleOptions,
): Promise<ImageData> {
  const modelKey = `${options.scale}x`;

  if (currentModelKey !== modelKey || !currentSession) {
    if (currentSession) {
      try { currentSession.release(); } catch {}
      currentSession = null;
    }

    const modelBuffer = await loadModelBuffer(options.scale, options.onProgress);
    const result = await createSessionWithFallback(modelBuffer, options.backend, options.onProgress);
    currentSession = result.session;
    currentModelKey = modelKey;
  }

  const ort = await getOrt();
  const { processWithTiling } = await import('./tile');
  return processWithTiling(currentSession, ort, imageData, options);
}

export function disposeEngine() {
  if (currentSession) {
    try { currentSession.release(); } catch {}
    currentSession = null;
    currentModelKey = '';
  }
}

export type ScaleFactor = 2 | 4;
export type InferenceBackend = 'webgpu' | 'webgl' | 'wasm';

export interface UpscaleOptions {
  scale: ScaleFactor;
  backend: InferenceBackend;
  tileSize?: number;
  overlap?: number;
  onProgress?: (p: UpscaleProgress) => void;
}

export interface UpscaleProgress {
  phase: 'loading-model' | 'preprocessing' | 'inferring' | 'done';
  detail?: string;
  percent?: number;
}

export interface TileInfo {
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
  padX: number;
  padY: number;
  padW: number;
  padH: number;
}

export const MODEL_URLS: Record<ScaleFactor, string> = {
  2: 'https://huggingface.co/JoPmt/Real_Esrgan_x2_Onnx_Tflite_Tfjs/resolve/main/model.onnx',
  4: 'https://huggingface.co/bukuroo/RealESRGAN-ONNX/resolve/main/real-esrgan-x4plus-128.onnx',
};

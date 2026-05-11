type ToolModule = {
  default: {
    id: string;
    name: string;
    icon: string;
    render: (container: HTMLElement) => void;
    destroy?: () => void;
  };
};

type RouteHandler = () => void;

let currentToolId: string | null = null;
let contentArea: HTMLElement | null = null;
const listeners: RouteHandler[] = [];

// 工具路由表 - 懒加载
const toolLoaders: Record<string, () => Promise<ToolModule>> = {
  'home': () => import('../pages/home'),
  // 分类页
  'text': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('text') })),
  'image': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('image') })),
  'code': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('code') })),
  'conversion': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('conversion') })),
  'generator': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('generator') })),
  'security': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('security') })),
  'utility': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('utility') })),
  'network': () => import('../pages/category').then(m => ({ default: m.createCategoryPage('network') })),
  // 文本工具
  'text-diff': () => import('../pages/tools/text-diff'),
  'full-half-width': () => import('../pages/tools/full-half-width'),
  'char-count': () => import('../pages/tools/char-count'),
  'text-dedup': () => import('../pages/tools/text-dedup'),
  'word-extract': () => import('../pages/tools/word-extract'),
  'text-replace': () => import('../pages/tools/text-replace'),
  'char-counter': () => import('../pages/tools/char-counter'),
  'case-converter': () => import('../pages/tools/case-converter'),
  'cn-traditional': () => import('../pages/tools/cn-traditional'),
  'en-case': () => import('../pages/tools/en-case'),
  'hanzi-pinyin': () => import('../pages/tools/hanzi-pinyin'),
  'md-to-word': () => import('../pages/tools/md-to-word'),
  // 代码工具
  'json-formatter': () => import('../pages/tools/json-formatter'),
  'code-beautify': () => import('../pages/tools/code-beautify'),
  'regex-test': () => import('../pages/tools/regex-test'),
  // 格式转换
  'base64': () => import('../pages/tools/base64'),
  'url-encode': () => import('../pages/tools/url-encode'),
  // 生成器
  'password-gen': () => import('../pages/tools/password-gen'),
  'uuid-gen': () => import('../pages/tools/uuid-gen'),
  'lorem-gen': () => import('../pages/tools/lorem-gen'),
  // 图片工具
  'image-compress': () => import('../pages/tools/image-compress'),
  'image-crop': () => import('../pages/tools/image-crop'),
  'image-base64': () => import('../pages/tools/image-base64'),
  // 安全工具
  'hash-gen': () => import('../pages/tools/hash-gen'),
  'hmac-gen': () => import('../pages/tools/hmac-gen'),
  // 实用工具
  'qr-code': () => import('../pages/tools/qr-code'),
  // 网络工具
  'ip-query': () => import('../pages/tools/ip-query'),
};

function getToolId(): string {
  const hash = location.hash.slice(2);
  return hash || 'home';
}

function setContentArea(el: HTMLElement) {
  contentArea = el;
}

async function navigate(toolId: string) {
  // 如果是同一个工具，跳过
  if (toolId === currentToolId) return;

  if (!contentArea) return;

  currentToolId = toolId;

  // 加载新工具
  const loader = toolLoaders[toolId];
  if (!loader) {
    contentArea.innerHTML = `<div class="content"><h2>404 - 工具未找到</h2></div>`;
    return;
  }

  try {
    const mod = await loader();
    contentArea.innerHTML = '';
    mod.default.render(contentArea);
  } catch (err) {
    console.error('Failed to load tool:', toolId, err);
    contentArea.innerHTML = `<div class="content"><h2>加载失败</h2><p>${err}</p></div>`;
  }

  listeners.forEach(fn => fn());
}

function onRouteChange(fn: RouteHandler) {
  listeners.push(fn);
}

function registerTool(id: string, loader: () => Promise<ToolModule>) {
  toolLoaders[id] = loader;
}

function getCurrentToolId(): string {
  return getToolId();
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    navigate(getToolId());
  });
}

export {
  initRouter,
  setContentArea,
  navigate,
  onRouteChange,
  registerTool,
  getCurrentToolId,
  type ToolModule,
};

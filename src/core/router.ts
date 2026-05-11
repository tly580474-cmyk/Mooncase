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

let currentTool: ToolModule['default'] | null = null;
let contentArea: HTMLElement | null = null;
const listeners: RouteHandler[] = [];

// 工具路由表 - 懒加载
const toolLoaders: Record<string, () => Promise<ToolModule>> = {
  'home': () => import('../pages/home'),
};

function getToolId(): string {
  const hash = location.hash.slice(2);
  return hash || 'home';
}

function setContentArea(el: HTMLElement) {
  contentArea = el;
}

async function navigate(toolId: string) {
  if (toolId === getToolId() && currentTool) return;

  // 销毁当前工具
  if (currentTool?.destroy) {
    currentTool.destroy();
  }

  if (!contentArea) return;

  // 加载新工具
  const loader = toolLoaders[toolId];
  if (!loader) {
    contentArea.innerHTML = `<div class="content"><h2>404 - 工具未找到</h2></div>`;
    currentTool = null;
    return;
  }

  try {
    const mod = await loader();
    currentTool = mod.default;
    contentArea.innerHTML = '';
    currentTool.render(contentArea);
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

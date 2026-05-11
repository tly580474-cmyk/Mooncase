import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { initShell } from './core/shell';

document.addEventListener('DOMContentLoaded', () => {
  initShell();

  // 首次加载时导航到 hash 指定的页面
  if (!location.hash || location.hash === '#/') {
    location.hash = '#/home';
  } else {
    // 触发路由
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
});

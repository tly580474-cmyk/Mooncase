import { icon } from '../../core/icons';

export default {
  id: 'text-diff',
  name: '文本差异对比',
  icon: 'difference',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/text" class="tool-page-back">${icon('swap_horiz')} 文本工具</a>
          <h1 style="font: var(--text-headline-md);">文本差异对比</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">高亮显示两段文本的逐行差异</p>
        </div>

        <div class="tool-page-body">
          <div class="tool-split">
            <div class="tool-split-pane">
              <label class="tool-label">原始文本</label>
              <textarea id="diff-left" class="tool-textarea" rows="16" placeholder="粘贴原始文本..."></textarea>
            </div>
            <div class="tool-split-pane">
              <label class="tool-label">修改后文本</label>
              <textarea id="diff-right" class="tool-textarea" rows="16" placeholder="粘贴修改后的文本..."></textarea>
            </div>
          </div>

          <div class="tool-actions">
            <button class="btn btn-primary" id="diff-btn">对比差异</button>
            <button class="btn btn-secondary" id="diff-clear">清空</button>
          </div>

          <div id="diff-result" style="display: none;">
            <label class="tool-label">对比结果</label>
            <div id="diff-output" class="tool-output"></div>
          </div>
        </div>
      </div>
    `;

    const leftEl = container.querySelector('#diff-left') as HTMLTextAreaElement;
    const rightEl = container.querySelector('#diff-right') as HTMLTextAreaElement;
    const resultEl = container.querySelector('#diff-result') as HTMLElement;
    const outputEl = container.querySelector('#diff-output') as HTMLElement;

    container.querySelector('#diff-btn')!.addEventListener('click', () => {
      const left = leftEl.value;
      const right = rightEl.value;
      if (!left && !right) return;

      const leftLines = left.split('\n');
      const rightLines = right.split('\n');
      const maxLen = Math.max(leftLines.length, rightLines.length);

      let html = '<table class="diff-table">';
      for (let i = 0; i < maxLen; i++) {
        const l = leftLines[i] ?? '';
        const r = rightLines[i] ?? '';
        const isSame = l === r;
        const cls = isSame ? '' : (l && !r ? 'diff-del' : (!l && r ? 'diff-add' : 'diff-mod'));
        html += `<tr class="${cls}">
          <td class="diff-ln">${i + 1}</td>
          <td class="diff-text">${escapeHtml(l)}</td>
          <td class="diff-ln">${i + 1}</td>
          <td class="diff-text">${escapeHtml(r)}</td>
        </tr>`;
      }
      html += '</table>';
      outputEl.innerHTML = html;
      resultEl.style.display = 'block';
    });

    container.querySelector('#diff-clear')!.addEventListener('click', () => {
      leftEl.value = '';
      rightEl.value = '';
      resultEl.style.display = 'none';
    });
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

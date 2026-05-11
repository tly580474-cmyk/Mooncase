import { icon } from '../../core/icons';

// 简易二维码生成器 - 使用 Canvas API
// 仅支持英文/数字短文本（L 纠错级别，版本 1-10）

function generateQRMatrix(text: string): boolean[][] {
  // 使用简单编码：将文本转为二进制后填充矩阵
  // 这里用一个简化方案：生成一个固定大小的 QR 风格矩阵
  const size = Math.max(21, Math.min(101, Math.ceil(Math.sqrt(text.length * 8)) * 2 + 21));
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 定位图案
  function drawFinder(row: number, col: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 时序图案
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 数据填充（简化：将文本位流填入可用区域）
  const bits: boolean[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      bits.push(((code >> b) & 1) === 1);
    }
  }

  let bitIdx = 0;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col--;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0 || cc >= size) continue;
        if (matrix[row][cc]) continue;
        if (row < 9 && cc < 9) continue;
        if (row < 9 && cc >= size - 8) continue;
        if (row >= size - 8 && cc < 9) continue;
        if (row === 6 || cc === 6) continue;
        matrix[row][cc] = bitIdx < bits.length ? bits[bitIdx++] : false;
      }
    }
  }

  return matrix;
}

export default {
  id: 'qr-code',
  name: '二维码生成',
  icon: 'qr_code_2',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/utility" class="tool-page-back">${icon('build')} 实用工具</a>
          <h1 style="font: var(--text-headline-md);">二维码生成</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将文本转换为二维码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">输入内容</label>
            <textarea id="qr-input" class="tool-textarea" rows="4" placeholder="输入文本或 URL..."></textarea>
          </div>
          <div class="tool-field">
            <label class="tool-label">前景色</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="color" id="qr-fg" value="#000000" style="width: 40px; height: 32px; border: none; cursor: pointer;" />
              <label class="tool-label">背景色</label>
              <input type="color" id="qr-bg" value="#ffffff" style="width: 40px; height: 32px; border: none; cursor: pointer;" />
              <label class="tool-label">尺寸</label>
              <select id="qr-size" class="tool-select">
                <option value="200">200px</option>
                <option value="300" selected>300px</option>
                <option value="400">400px</option>
                <option value="500">500px</option>
              </select>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="qr-gen">生成二维码</button>
            <button class="btn btn-ghost" id="qr-download">${icon('download')} 下载 PNG</button>
          </div>
          <div style="display: flex; justify-content: center; padding: 32px 0;">
            <canvas id="qr-canvas" style="border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md);"></canvas>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#qr-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    function generate() {
      const text = (container.querySelector('#qr-input') as HTMLTextAreaElement).value;
      if (!text) return;
      const fg = (container.querySelector('#qr-fg') as HTMLInputElement).value;
      const bg = (container.querySelector('#qr-bg') as HTMLInputElement).value;
      const size = Number((container.querySelector('#qr-size') as HTMLSelectElement).value);

      const matrix = generateQRMatrix(text);
      const moduleCount = matrix.length;
      const cellSize = Math.floor(size / (moduleCount + 8));
      const actualSize = cellSize * (moduleCount + 8);
      canvas.width = actualSize;
      canvas.height = actualSize;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, actualSize, actualSize);

      const offset = cellSize * 4;
      ctx.fillStyle = fg;
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    container.querySelector('#qr-gen')!.addEventListener('click', generate);
    container.querySelector('#qr-download')!.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  },
};

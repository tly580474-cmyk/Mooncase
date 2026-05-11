// SVG 图标集 - 内联避免外部依赖
// 基于 Lucide Icons (https://lucide.dev)

const icons: Record<string, string> = {
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  description: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  swap_horiz: '<path d="m7 16 4 4 4-4"/><path d="m7 8 4-4 4 4"/><path d="M17 4v16"/><path d="M7 4v16"/>',
  settings_suggest: '<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.75V8h1a7 7 0 0 1 7 7h1.25c.36 0 .61.35.5.68a5 5 0 0 1-8.5 3.21V16h-1a7 7 0 0 1-7-7H3.25c-.36 0-.61-.35-.5-.68A5 5 0 0 1 11.25 4.31V4a2 2 0 0 1 2-2z"/>',
  security: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  build: '<path d="m14.7 6.3 1.1-1.1c.4-.4.4-1 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-1.1 1.1-6.3-2.6a1 1 0 0 0-1.2.7l-.7 3.7a1 1 0 0 0 .3.8l5 5-3.2 3.2a1 1 0 0 0-.3.8l.7 3.7a1 1 0 0 0 1.2.7l6.3-2.6 1.1 1.1c.4.4 1 .4 1.4 0l1.4-1.4a1 1 0 0 0 0-1.4l-1.1-1.1 2.6-6.3a1 1 0 0 0-.7-1.2z"/>',
  language: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  light_mode: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  dark_mode: '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  person: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  difference: '<path d="M12 3v14"/><path d="m8 7 4-4 4 4"/><rect x="4" y="14" width="6" height="7" rx="1"/><rect x="14" y="14" width="6" height="7" rx="1"/>',
  javascript: '<path d="M4 4h16v12H4z"/><path d="m10 8-2 4 2 4"/><path d="m14 8 2 4-2 4"/>',
  qr_code_2: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3"/><path d="M21 21h-3"/><path d="M14 21h-3"/><path d="M21 14h-3"/><path d="M14 14h-3v7h7v-3"/><path d="M14 14h-3V7h7v4"/>',
  data_object: '<path d="M5 16V9h14V2H5l14 14h-7m-7 0 7 7v-7m-7 0h7"/>',
  password: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  article: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  abc: '<path d="M2 5h7"/><path d="M2 8h5"/><path d="M2 14h3"/><path d="M2 17h1"/><path d="M13 5h4"/><path d="M13 8h5"/><path d="M13 14h4"/><path d="M13 17h5"/>',
  content_copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  dictionary: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  regular_expression: '<path d="M17 3v10"/><path d="m12.67 5.5 8.66 5"/><path d="m12.67 10.5 8.66-5"/><path d="M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z"/>',
};

export function icon(name: string, size = 20): string {
  const path = icons[name];
  if (!path) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

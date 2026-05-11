export type ToolCategory =
  | 'text'
  | 'image'
  | 'code'
  | 'conversion'
  | 'generator'
  | 'security'
  | 'utility'
  | 'network';

export interface ToolMeta {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
  description: string;
  tags: string[];
}

const registry: ToolMeta[] = [
  {
    id: 'text-diff',
    name: '文本差异对比',
    icon: 'diff',
    category: 'text',
    description: '高亮显示两段文本的逐行差异',
    tags: ['diff', 'compare', '对比', '差异', '文本'],
  },
  {
    id: 'full-half-width',
    name: '全半角转换',
    icon: 'swap_horiz',
    category: 'text',
    description: '中英文全角半角字符互转',
    tags: ['全角', '半角', '转换', 'text'],
  },
  {
    id: 'char-count',
    name: '字符统计',
    icon: 'abc',
    category: 'text',
    description: '统计文本的字符数、单词数、行数',
    tags: ['count', '统计', '字符', '字数'],
  },
  {
    id: 'text-dedup',
    name: '文本去重',
    icon: 'content_copy',
    category: 'text',
    description: '去除重复行，支持排序',
    tags: ['dedup', '去重', '重复'],
  },
  {
    id: 'word-extract',
    name: '单词提取',
    icon: 'dictionary',
    category: 'text',
    description: '从文本中提取所有不重复的单词',
    tags: ['word', '提取', '单词'],
  },
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    icon: 'data_object',
    category: 'code',
    description: '格式化、压缩、验证 JSON 数据',
    tags: ['json', 'format', '格式化', '压缩'],
  },
  {
    id: 'code-beautify',
    name: '代码美化',
    icon: 'code',
    category: 'code',
    description: 'HTML / CSS / JS 代码格式化',
    tags: ['code', 'beautify', '美化', '格式化'],
  },
  {
    id: 'regex-test',
    name: '正则测试',
    icon: 'regular_expression',
    category: 'code',
    description: '实时测试正则表达式匹配',
    tags: ['regex', '正则', '匹配'],
  },
  {
    id: 'password-gen',
    name: '密码生成器',
    icon: 'password',
    category: 'generator',
    description: '生成安全随机密码',
    tags: ['password', '密码', '生成', '安全'],
  },
  {
    id: 'uuid-gen',
    name: 'UUID 生成器',
    icon: 'tag',
    category: 'generator',
    description: '生成 v4 UUID',
    tags: ['uuid', '生成', 'id'],
  },
  {
    id: 'lorem-gen',
    name: '占位文生成',
    icon: 'article',
    category: 'generator',
    description: '生成 Lorem Ipsum 占位文本',
    tags: ['lorem', '占位', '生成', 'placeholder'],
  },
  {
    id: 'qr-code',
    name: '二维码生成',
    icon: 'qr_code_2',
    category: 'utility',
    description: '将文本转换为二维码',
    tags: ['qr', '二维码', '生成'],
  },
  {
    id: 'base64',
    name: 'Base64 编码',
    icon: 'code',
    category: 'conversion',
    description: '文本与 Base64 互转',
    tags: ['base64', '编码', '解码', '转换'],
  },
  {
    id: 'url-encode',
    name: 'URL 编码',
    icon: 'link',
    category: 'conversion',
    description: 'URL 编码与解码',
    tags: ['url', '编码', '解码', 'encode'],
  },
  {
    id: 'ip-query',
    name: 'IP 地址查询',
    icon: 'language',
    category: 'network',
    description: '查询当前公网 IP 地址',
    tags: ['ip', '查询', '网络'],
  },
];

export function getRegistry(): ToolMeta[] {
  return registry;
}

export function getToolMeta(id: string): ToolMeta | undefined {
  return registry.find(t => t.id === id);
}

export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return registry.filter(t => t.category === category);
}

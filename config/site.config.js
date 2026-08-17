/**
 * This file contains the configuration used for customising the website, such as the folder to share,
 * the title, used Google fonts, site icons, contact info, etc.
 */
module.exports = {
  // 你的 Microsoft 账户邮箱，保持你原有配置不变
  userPrincipalName: process.env.USER_PRINCIPLE_NAME || 'linyichen1995@outlook.com',
  // 网站图标，保持你原有配置不变
  icon: '/icons/128.png',
  // 站点名称
  title: "OneDrive网盘",
  // 共享根目录，保持你原有配置不变
  baseDirectory: process.env.BASE_DIRECTORY || '/公开',
  // 单页最大展示数量
  maxItems: 100,

  // 已禁用 Google 字体，改用系统原生字体，提升加载速度
  // googleFontSans: 'Noto Sans SC',
  // googleFontMono: 'JetBrains Mono',
  // googleFontLinks: ['https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap'],

  // 页脚内容
  footer: '© 2026 OneDrive网盘 | 仅供个人使用',

  // 受密码保护的目录，保持你原有配置不变
  protectedRoutes: ['/Private', '/Demo/😎Another Private Folder Password 123'],
  // 导航栏邮箱，留空则不显示
  email: '',
  // 社交链接，保持你原有配置不变
  links: [],

  // 日期时间格式
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',

  // OPDS 电子书目录，保持你原有配置不变
  opds: {
    enabled: false,
    title: "OneDrive网盘",
    description: 'OPDS 目录由 onedrive-cf-index-ng 驱动',
    fileExtensions: ['.epub', '.pdf', '.mobi', '.azw3', '.azw', '.cbz', '.cbr'],
  },
}

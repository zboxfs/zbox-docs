module.exports = {
  title: 'Zbox Docs',
  description: 'Zbox documentation',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  plugins: [
    '@vuepress/active-header-links',
    '@vuepress/back-to-top'
  ],
  themeConfig: {
    nav: [
      { text: 'Zbox', link: 'https://zbox.io' },
      { text: 'Sign In', link: 'https://console.zbox.io/signin' },
      { text: 'GitHub', link: 'https://github.com/zboxfs/zbox-docs' }
    ],
    sidebar: [
      ['/', 'Introduction'],
      '/getting-started',
      '/reference',
      '/internals'
    ]
  }
};

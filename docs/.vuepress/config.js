module.exports = {
  title: 'Zbox Docs',
  description: 'Introduction, getting started guides, tutorials and API reference documentation for Zbox',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  plugins: [
    '@vuepress/active-header-links',
    '@vuepress/back-to-top',
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-97176621-2'
      }
    ]
  ],
  themeConfig: {
    logo: '/logo.svg',
    sidebarDepth: 2,
    nav: [
      { text: 'Zbox', link: 'https://zbox.io' },
      { text: 'Sign In', link: 'https://console.zbox.io/signin' },
      { text: 'GitHub', link: 'https://github.com/zboxfs/zbox-docs' }
    ],
    sidebar: [
      ['/', 'Introduction'],
      '/getting-started',
      '/tutorials',
      {
        title: 'API Reference',
        path: '/api/',
        sidebarDepth: 2,
        children: [
          '/api/',
          '/api/javascript',
          '/api/rust'
        ]
      }
    ]
  }
};

module.exports = {
  title: 'Zbox Docs',
  description: 'Zbox documentation',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  plugins: [
    '@vuepress/active-header-links',
    '@vuepress/back-to-top',
    [
      '@vuepress/google-analytics',
      {
        'ga': '' // UA-00000000-0
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
      {
        title: 'Tutorials',
        path: '/tutorials/',
        sidebarDepth: 2,
        children: [
          '/tutorials/hello-world'
        ]
      },
      {
        title: 'API Reference',
        path: '/api/',
        sidebarDepth: 2,
        children: [
          '/api/javascript',
          '/api/rust'
        ]
      }
    ]
  }
};

docute.init({
  repo: 'hkwu/ghastly',
  url: 'https://ghastly.js.org',
  'edit-link': 'https://github.com/hkwu/ghastly/blob/master/docs',
  nav: [
    {
      title: 'Home',
      path: '/',
    },
  ],
  plugins: [
    docsearch({
      apiKey: '0aa8629bea882ad58d7b30ccd30d03f4',
      indexName: 'ghastly',
    }),
  ],
});

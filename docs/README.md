<div align="center">
  <a href="https://ghastly.js.org" target="_blank"><img src="/assets/logo.png"></a>
  <h1>Ghastly</h1>
  <a href="https://www.npmjs.com/package/ghastly"><img src="https://img.shields.io/npm/v/ghastly.svg" alt="npm"></a>
  <a href="https://travis-ci.org/hkwu/ghastly"><img src="https://img.shields.io/travis/hkwu/ghastly.svg" alt="build"></a>
  <a href="https://doc.esdoc.org/github.com/hkwu/ghastly"><img src="https://doc.esdoc.org/github.com/hkwu/ghastly/badge.svg" alt="docs"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/ghastly.svg" alt="license"></a>
</div>

## Introduction
Ghastly is a modular command library built for Discord.js bots. It provides a powerful but flexible API which abstracts away boilerplate and makes command building a more elegant process.

### Installation
Ghastly is available through [npm](https://www.npmjs.com/package/ghastly).

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

You should also install Discord.js v11 if you haven't already. This library requires Node.js >=7. For Node.js <7.6, you must start your application using `node --harmony` in order to enable support for `async` functions.

### Foreword
This documentation assumes that you have a basic grasp of the Discord.js API. If not, it would be a good idea to [familiarize yourself](https://discord.js.org/#/) with it prior to building a bot with Ghastly.

It would also be helpful to be comfortable with ES2015+ features such as promises and `async` functions.

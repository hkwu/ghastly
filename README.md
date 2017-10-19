<div align="center">
  <a href="https://ghastly.js.org" target="_blank"><img src="https://ghastly.js.org/assets/logo.png"></a>
  <h1>Ghastly</h1>
  <a href="https://www.npmjs.com/package/ghastly"><img src="https://img.shields.io/npm/v/ghastly.svg" alt="npm"></a>
  <a href="https://travis-ci.org/hkwu/ghastly"><img src="https://img.shields.io/travis/hkwu/ghastly.svg" alt="build"></a>
  <a href="https://hkwu.github.io/ghastly-docs"><img src="https://hkwu.github.io/ghastly-docs/badge.svg" alt="docs"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/ghastly.svg" alt="license"></a>
</div>

## Introduction
Ghastly is a modular command library built for Discord.js bots. It provides a powerful but flexible API which abstracts away boilerplate and makes command building a more elegant process.

## Installation
Ghastly is available through [npm](https://www.npmjs.com/package/ghastly).

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

You should also install Discord.js v11 if you haven't already. This library requires Node.js >=7. For Node.js <7.6, you must start your application using `node --harmony` in order to enable support for `async` functions.

## Example
This is a short runnable snippet using Ghastly. You can find more information and examples on the [Ghastly website](https://ghastly.js.org).

```js
const { Client } = require('ghastly');

function ping() {
  async function handler() {
    return 'Pong!';
  }
  
  return {
    handler,
    triggers: ['ping'],
  };
}

const client = new Client({ prefix: '!' });

client.commands.add(ping);
client.login('token');
```

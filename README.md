# Ghastly

A lightweight library designed to make it easier to modularize clients built on top of [Discord.js](http://hydrabolt.github.io/discord.js/).

## Installation

To install, use

```bash
npm install --save ghastly
```

Discord.js is a peer dependency for this package, so make sure you have it installed as well.

## Quick Start

Import the Ghastly client constructor, define some commands, register them and login. That's it!

Further documentation is available on the [GitHub project page](https://hkwu.github.io/ghastly).

```js
import Discord from 'discord.js';
import { Command, make } from 'ghastly';

class Ping extends Command {
  get signature() {
    return '!ping'; // responds to messages starting with '!ping'
  }

  handle(message, args) {
    // ignore args for now
    message.reply('pong!');
  }
}

const client = make(Discord.Client).addCommand('ping', Ping);
client.login('token');
```

Usage with `require()` is similar.

```js
const Discord = require('discord.js');
const Ghastly = require('ghastly');

class Ping extends Ghastly.Command {
  get signature() {
    return '!ping'; // responds to messages starting with '!ping'
  }

  handle(message, args) {
    // ignore args for now
    message.reply('pong!');
  }
}

const client = Ghastly.make(Discord.Client).addCommand('ping', Ping);
client.login('token');
```

## Developing

### Linting

Use

```bash
npm run lint
```

to lint the `src/` folder. To fix some linting errors automatically, use

```bash
npm run lint:fix
```

### Testing

Run

```bash
npm run test
```

[Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) (with the `expect` BDD style) are used for unit testing.

### Building

This library uses [Babel](https://babeljs.io/) to transpile the source code into the final distributed library. Simply make changes to the source in `src/` then type

```bash
npm run build
```

to transpile the entire `src/` directory into the `lib/` directory. You can also use

```
npm run watch
```

to continuously watch the `src/` directory for changes and transpile on the go.

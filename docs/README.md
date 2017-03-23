# Ghastly
[![npm](https://img.shields.io/npm/v/ghastly.svg?style=flat-square)](https://www.npmjs.com/package/ghastly)
[![npm](https://img.shields.io/npm/l/ghastly.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Introduction
Ghastly is a modular command library built for Discord.js bots. It aims to provide a powerful but flexible API which abstracts away boilerplate and lets you deal directly with the core logic of a command.

## Installation
Ghastly is available through [npm](https://www.npmjs.com/package/ghastly).

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

## Getting Started
### Foreword
This documentation assumes that you have a basic grasp of the Discord.js API. If not, it would be a good idea to [familiarize yourself](https://discord.js.org/#/) with it prior to building a bot with Ghastly.

It would also be helpful to be comfortable with ES2015+ features such as promises and `async` functions.

### Hello, world
Let's walk through the basics of Ghastly using the most appropriate exercise: a "Hello, world" command. To create a command, we define a function which returns an object. This object needs two properties to work properly: a `handler` function to generate a response and a set of `triggers` which determine when a command is dispatched. With that in mind, take a peek at our "Hello, world" command below.

```js
function helloWorld() {
  function handler() {
    return 'world!';
  }

  return {
    handler,
    triggers: ['hello'],
  };
}
```

Notice how we didn't even need to touch a `Message` object. Handler functions have a specific purpose in Ghastly: they consume a received message and produce a response value. There's no need to actually use a `send()` method directly; Ghastly already does that for you.

Our bot will now listen for messages starting with `hello` and promptly respond with `world!`. This is great, though it does pose a problem since we'll be rather trigger happy with messages that weren't necessarily directed at us.

To solve that problem, we'll pass in the Ghastly-specific `prefix` option to the client constructor. This will make Ghastly ignore messages that don't start with the given prefix, so instead of responding to `hello`, we'll respond to `!hello`. Prefixes can include spaces, too, so you could also use something like `hey siri` as a prefix.

```js
import { Client } from 'ghastly';

const client = new Client({ prefix: '!' });
```

<p class="tip">
  The Ghastly client actually extends the Discord.js client, so if you need to pass in any `ClientOptions`, now would be the time.
</p>

Now that our client is instantiated, we can start registering commands on the client's dispatcher.

```js
client.dispatcher.loadCommands(helloWorld);
```

Once our command is loaded, we can `login()` with the client and test it out.

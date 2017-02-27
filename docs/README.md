# Ghastly
Ghastly is a modular command-based framework for Discord.js. It provides a maintainable way to process and respond to user input while remaining simple in its API.

## Getting Started
### Installation
Ghastly is available through npm.

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

### Usage
All library exports are named in order to be consistent between Node's module system and the ES2015 module specification.

Node:
```js
const { Client } = require('ghastly');
```

ES2015:
```js
import { Client } from 'ghastly';
```

You may use whichever syntax you prefer, however examples in the documentation will utilize the ES2015 syntax.

## Core Concepts
### Commands
The main purpose of Ghastly is to ease the design and management of client commands. This allows you to avoid the boilerplate and/or spaghetti code that inevitably results when defining inline commands with the native Discord.js events system.

#### Defining Commands
Unlike other command frameworks, Ghastly doesn't export any base `Command` class. Commands are defined as functions. This is meant to encourage stateless commands, which will help keep your code focused and easy to reason about.

```js
function ping() {
  function handler() {
    return 'Pong!';
  }

  return {
    handler,
    triggers: [
      'ping',
    ],
  };
}
```

These functions must return a configuration object which describes the behaviour of the command.

#### Handling Responses
The `handler` property of the configuration object is what gets called when the command is triggered. It should contain the main logic for making a response based on the user input received from the client.

```js
function handler() {
  // command logic
  return 'message';
}
```

The return value of the handler determines how the dispatcher responds to a command. For instance, a string indicates that a message should be sent back to the origin channel. There are other values the handler can return as well. Those are covered in the section on indicator values.

#### Response Context
The handler receives a `context` object as its only argument. The context contains useful properties for making responses.

##### `context.message`
The Discord.js `Message` object representing the message which triggered the command.

```js
function handler(context) {
  console.log(context.message.content);
}
```

##### `context.args`
The parsed command arguments. These arguments are parsed from the message according to their type. Arguments must be named, so they can be referenced directly via `context.args.name`.

##### `context.client`
A reference to the Ghastly client. This is just a convenience property, since the client is also available via `context.message`.

##### `context.commands`
The dispatcher's command registry.

##### `context.services`
The dispatcher's service registry.

<p class="tip">
  [Object destructuring](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) can make your life much easier when working with the context object (or any object, for that matter).
</p>

### The Dispatcher
In order to filter and route messages, Ghastly provides the `Dispatcher` class. The dispatcher listens to message events on the client and triggers any commands it detects in the messages.

#### Prefixes
The dispatcher takes care of filtering messages based on a prefix. You should specify the prefix you want to use when constructing the dispatcher.

```js
import { Dispatcher } from 'ghastly';

const dispatcher = new Dispatcher({ prefix: '!' });
```

##### String

The prefix can be any string (spaces are valid), with specific exceptions as outlined further below.

```js
const dispatcher = new Dispatcher({ prefix: '> ' });
```

<p class="warning">
  Since spaces are treated as part of the prefix, the above dispatcher will respond to messages of the form `> hello, world`, but will *not* respond to `>hello, world`.
</p>

##### Mention
You can use the client's mention as a prefix. This is the recommended prefix as it's inherently unique.

```js
const dispatcher = new Dispatcher({ prefix: '@self' });
```

The dispatcher will only respond to `@client#1234 messages like these`.

#### Registering Commands
Before attaching the dispatcher to the client, you should register all your commands. The `loadCommands()` method takes a variable number of command functions and registers them with the dispatcher.

```js
dispatcher.loadCommands(foo, bar, baz);
```

<p class="danger">
  `loadCommands()` does *not* take an array as an argument. In that case, you should use array spread to expand the array: `dispatcher.loadCommands(...commands)`.
</p>

#### Registering the Client
The dispatcher must register itself with the client in order to intercept message events and dispatch responses.

```js
import { Client } from 'ghastly';

const client = new Client();

client.use(dispatcher).login('token');
```

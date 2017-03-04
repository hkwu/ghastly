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

#### Configurators
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

These functions must return a configuration object which describes the behaviour of the command. To keep things simple, we'll label these functions as command configurators, or **configurators** for short.

##### The Configuration Object
Let's examine what the configuration object should actually contain.

###### Handler
The `handler` is a function that gets called when the command is triggered. It should contain the main logic for making a response based on the user input received from the client.

```js
function handler() {
  // command logic
  return 'message';
}
```

###### Triggers
`triggers` is a non-empty array of strings. The first string is treated as the command's main name while any additional values are used as aliases for the command.

```js
return {
  triggers: [
    'mainTrigger',
    'firstAlias',
    'secondAlias',
  ],
};
```

###### Parameters
Your command may accept any number of parameters of various types. `parameters` is an array of parameter definitions. There are actually two different ways to define parameters, but both will yield the same end result.

```js
return {
  parameters: [
    'parameter : This is a parameter definition.',
    {
      name: 'parameterCopy',
      description: 'This is also a parameter definition.',
    },
  ],
};
```

###### Description
The `description` is an optional string which describes the command's function and is only stored for your own use (useful if you're making a `help` command, for instance).

###### Middleware
You can also define middleware for your commands. Middleware are simply functions which wrap the command handler. They provide an easy, modular way to extend command handler functionality.

The `middleware` array is an array of middleware that will be applied to the command's handler function. Middleware are executed in the order they're defined in the `middleware` array.

```js
import first from './first';
import second from './second';

return {
  middleware: [
    first(),
    second(),
  ],
};
```

If you're not familiar with the concept of middleware, it's useful to just think of them as opaque tools that you can plug in and forget. We will cover middleware usage and the process of creating your own middleware in [another section](#middleware1).

#### Defining a Handler
It's time to dive deeper into actually building a command handler. There are two main ideas here:
* Responses are values.
* Context is injected.

##### Response Types
Handlers don't actually need to interact with the Discord.js `Message` object in order to send responses. Ghastly can evaluate the return value of handlers and automate the response process based on the returned value's type. This saves you from repeating `message.channel.sendMessage()` in every single one of your handlers.

<p class="tip">
  Although all the examples below use a synchronous handler function, you can also define handlers as `async` functions as desired.
</p>

<p class="tip">
  Unless otherwise stated, responses will be sent to the channel from which the triggering message originated.
</p>

###### Strings
Return a string to trigger a plain text response. The text returned will be sent verbatim, so you can embed things such as Markdown, emoji codes or mentions directly (make sure they're in raw form as required by the Discord API!).

```js
function handler() {
  return 'I will get sent back where I came from!';
}
```

###### Arrays
Return an array to have Ghastly randomly select one of the array elements as the response to send.

```js
function handler() {
  return [
    'Will it be me?',
    'Or me?',
    'No, me!',
  ];
}
```

###### Embeds
Return a Discord.js `RichEmbed` object to send an embed.

```js
import { RichEmbed } from 'discord.js';

function handler() {
  const embed = new RichEmbed();

  embed.setTitle('My Embed')
    .setDescription('Just a small test.')
    .setTimestamp()
    .setFooter('Tiny footer text.');

  return embed;
}
```

###### Custom Responses
In case the above response types don't adequately cover your requirements, you can always elect to manually send responses.

```js
function handler({ message }) {
  message.channel.sendMessage('My message!');
}
```

Notice that returning a falsey value will cause Ghastly to take no response action.

<p class="tip">
  This example takes advantage of the `context` object that's passed to the handler during execution. The concept of handler context is covered in the next section.
</p>

Custom responses are useful for complex response flows, but they don't fit well with the concept of responses being values. That's why Ghastly provides the `CustomResponse` class and several specialized types with self-contained logic for [sending more complicated responses](#complex-response-types).

##### Context
The handler receives a `context` object as its only argument. The context contains useful properties for making responses.

###### `context.message`
The Discord.js `Message` object representing the message which triggered the command.

```js
function handler({ message }) {
  console.log(message.content);
}
```

###### `context.args`
The parsed command arguments. These arguments are parsed from the message according to their type. Arguments must be named, so they can be referenced directly via `context.args.name`.

###### `context.client`
A reference to the Ghastly client. This is just a convenience property, since the client is also available via `context.message`.

###### `context.commands`
The dispatcher's command registry.

###### `context.services`
The dispatcher's service registry.

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

## Advanced
### Complex Response Types
In addition to the basic response types, Ghastly provides more complex response handling through the `CustomResponse` class. `CustomResponse` is simply a wrapper for specialized response logic. This allows you to return an instance of a `CustomResponse` instead of coding a custom response in your handler.

```js
import { CustomResponse } from 'ghastly';

function handler() {
  const reverseResponse = new CustomResponse(({ message }) => message.content.split('').reverse().join(''));

  return reverseResponse;
}
```

Not only does this keep responses contained as values, but it also enables you to modularize your response logic and reuse it across several handlers. Of course, it's a pain to have to define your own response logic for simple things that are absent from the basic response types, so Ghastly provides a set of `CustomResponse` classes to handle some of the more common cases.

#### Code Blocks
You can send a multi-line code block using `CodeResponse`.

```js
import { CodeResponse } from 'ghastly';

function handler() {
  const response = new CodeResponse('js', `console.log('Hello, world');
console.log(2 + 2);`);
  
  return response;
}
```

#### Voice Responses
You can send an audio response to the voice channel the client is currently connected to using `VoiceResponse`. A response will be sent only if the message is received in a guild context. In addition, the client must be connected to a voice channel in that guild. In any other case, the response will be ignored.

```js
import ytdl from 'ytdl-core';
import { VoiceResponse } from 'ghastly';

function handler() {
  const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });

  // must be connected to voice channel at this point
  return new VoiceResponse('stream', stream);
}
```

The `VoiceResponse` constructor is designed to resemble the Discord.js `VoiceConnection` stream play methods.

```js
// play a file
const fileResponse = new VoiceResponse('file', '/path/to/file.mp3');

// send in StreamOptions
const fileResponseWithOptions = new VoiceResponse('file', 'path/to/file.mp3', { volume: 0.5 });
```

### Middleware
Ghastly provides a middleware system that allows additional logic to be wrapped around command handlers.

#### Usage
You can add middleware to a command by providing an array of middleware functions in your configurator object.

```js
return {
  middleware: [
    myMiddleware(),
  ],
};
```

Notice how we use `myMiddleware()` instead of `myMiddleware`. As a matter of convention, middleware are not used directly; they are always wrapped and created by higher order functions. This allows us to configure the middleware prior to attaching it to a command.

#### Creating Middleware
In order to define your own custom middleware, simply create a higher order function which returns the middleware function. We will call this function a middleware layer, or **layer** for short.

Layers receive two arguments: the `next` layer in the middleware chain, and the `context` object passed in by the previous layer. A layer has the power to continue the chain or exit it. By calling the `next` layer, the chain continues. Conversely, if the layer does not call `next`, the chain stops and no other layers are executed.

<p class="warning">
  Layers can be defined as synchronous or `async` functions, but it's prudent to be aware of the fact that the next layer could return a synchronous value or a promise. However, by using `async` functions you can easily `await` the return value of the next layer and not worry about whether or not it's synchronous.
</p>

```js
import util from 'util';

function loggingMiddleware() {
  return (next, context) => {
    console.log('Current context:');
    console.log(util.inspect(context));

    return next(context);
  };
}
```

When you're ready to use `loggingMiddleware`, just call it to create the layer.

```js
return {
  middleware: [
    loggingMiddleware(),
  ],
};
```

##### Working with Context
Since layers have direct access to the context object, they are able to read, write and even completely obliterate the context (though that's a stupid idea).

There are just a few points to keep in mind when working with the context. When modifying the context, always *clone* a new context object using `Object.assign()` before mutating it. This ensures that the context objects for each layer are isolated from each other as much as possible.

```js
function bad() {
  return (next, context) => {
    context.someImportantProperty = null;

    return next(context);
  };
}

function good() {
  return (next, context) => next(Object.assign({}, context, {
    someImportantProperty: null,
  }));
}
```

<p class="tip">
  It can be quite a handful to use `Object.assign()`, but until the [object rest/spread](https://github.com/sebmarkbage/ecmascript-rest-spread) proposal becomes a standard, this is the next best thing. Feel free to use [Babel](https://babeljs.io/) or another transpiler to take advantage of it, though!
</p>

Of course, there's no need to clone the context if you're just reading from it. Needless to say, you should also refrain from deleting properties from the context. This could potentially cause other layers which depend on those properties to fail.

##### Before and After
You can make your layer execute before or after other layers depending on when you delegate to the `next` layer. For instance, the following middleware will execute some logic then delegate to the next layer in the chain.

```js
function before() {
  return (next, context) => {
    doSomething(context);

    return next(context);
  };
}
```

Whereas this middleware will delegate and wait for the return value of the next layer before executing its own logic.

```js
function after() {
  return (next, context) => {
    const returned = next(context);

    doSomething(returned);

    return returned;
  };
}
```

The returned value depends on the layer that's immediately after the current layer. If there are no other layers left, the returned value is that of the command's handler function.

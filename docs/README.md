# Ghastly
[![npm](https://img.shields.io/npm/v/ghastly.svg?style=flat-square)](https://www.npmjs.com/package/ghastly)
[![npm](https://img.shields.io/npm/l/ghastly.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Ghastly is a modular command-based framework for Discord.js. It provides a maintainable way to process and respond to user input while remaining simple in its API.

## Getting Started
### Installation
Ghastly is available through [npm](https://www.npmjs.com/package/ghastly).

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

## Core Concepts
### The Client
At the core of this library is the Ghastly client. It provides an interface to register commands and services in addition to handling the tasks carried out by the base Discord.js client.

```js
import { Client } from 'ghastly';

const client = new Client();
```

The client processes messages using a `Dispatcher`. In order to take advantage of the dispatcher, you need to configure it when you create the client.

#### Prefixes
The dispatcher filters messages based on a prefix. The prefix can be any string (spaces are valid), with specific exceptions as outlined below.

```js
const client = new Client({ prefix: '> ' });
```

<p class="warning">
  Since spaces are treated as part of the prefix, the above dispatcher will respond to messages of the form `> hello, world`, but will *not* respond to `>hello, world`.
</p>

##### Mention
You can use the client's mention as a prefix. This is the recommended prefix as it's inherently unique.

```js
const client = new Client({ prefix: '@self' });
```

The dispatcher will only respond to `@client#1234 messages like these`.

#### Registering Commands
Commands should be registered before logging in with the client. The client's dispatcher (available through `client.dispatcher`) provides the `loadCommands()` method to register commands. It takes a variable number of commands and adds them to the command registry. The nature of these commands is detailed in the next section.

```js
client.dispatcher.loadCommands(foo, bar, baz);
```

<p class="danger">
  `loadCommands()` does *not* take an array as an argument. In that case, you should use array spread to expand the array: `dispatcher.loadCommands(...commands)`.
</p>

### Commands
The main purpose of Ghastly is to ease the design and management of client commands. This allows you to avoid the boilerplate and/or spaghetti code that inevitably results when defining inline commands with the native Discord.js events system.

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

#### Configuration
Let's examine what the configuration object should actually contain.

##### Handler
The `handler` is a function that gets called when the command is triggered. It should contain the main logic for making a response based on the user input received from the client.

```js
function handler() {
  // command logic
  return 'message';
}
```

##### Triggers
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

##### Parameters
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

##### Description
The `description` is an optional string which describes the command's function and is only stored for your own use (useful if you're making a `help` command, for instance).

##### Middleware
You can also define middleware for your commands. Middleware are simply functions which wrap the command handler. They provide an easy, modular way to extend command handler functionality.

The `middleware` array is an array of middleware that will be applied to the command's handler function. Middleware are executed in the order they're defined in the `middleware` array.

```js
return {
  middleware: [
    first(),
    second(),
  ],
};
```

If you're not familiar with the concept of middleware, it's useful to think of them as layers stacked on top of the command handler. Each layer can intercept and potentially alter what gets sent into the next layer. We will cover middleware usage and the process of creating your own middleware in [another section](#middleware1).

#### Command Parameters
The parameter system in Ghastly allows you to specify user inputs for your commands. All parameters are defined within the `parameters` array in your configuration options.

There are two different ways to define parameters: as strings or as object literals. Object literals have more flexibility and power, but strings are more fluent and easier to read.

##### Defining Parameters as Strings
The most basic parameters require only a name. The parameter name is used as a key when passing arguments to the command handler.

```js
return {
  parameters: [
    // defines a parameter called 'param'
    // the corresponding input will be passed to the command handler as `args.param`
    'param',
  ],
};
```

###### Description
Similarly to commands, you can add a description to your parameter.

```
param : This is a parameter description.
```

###### Optional Parameters
Optional parameters are identified by a leading `-` character.

```
- optionalParam : This is an optional parameter.
```

###### Parameter Types
It's possible to specify the expected type of a parameter's value by prefacing the parameter name with a type declaration.

```
(int) integerParam : This parameter's value will be interpreted as an integer.
```

Ghastly will attempt to coerce the raw value of the parameter into the specified type. If the raw value cannot be coerced, the input is rejected.

The following are the available parameter types:

* `boolean`, `bool`: either `'true'` or `'false'`, ignoring case.
* `integer`, `int`: an integer.
* `number`, `num`: any valid `Number`.
* `string`, `str`: a string. This is the default type.

###### Default Values
Default values may be specified for optional parameters by placing the value after the parameter name followed by a `=` character.

```
- optionalParamWithDefault = default : This is a parameter with a default value.
```

Parameters with defaults are automatically turned into optional parameters.

```
param = default : This is also an optional parameter.
```

<p class="warning">
  If a default is not provided, all optional parameters default to `null`.
</p>

###### Repeatable Values
You can define a parameter which takes multiple values by appending a `*` to the parameter name.

```
repeatableParam* : This parameter can take multiple values as input.
```

When the user calls this command, they can specify multiple values for this parameter as such:

```
@client echo one two three "four five"
```

The inputs will be passed in as an array: `['one', 'two', 'three', 'four five']`. Defaults can also be specified for repeatable parameters.

```
repeatableParam* = one "two three" : This repeatable parameter has defaults.
```

The given values will be parsed into an array: `['one', 'two three']`.

<p class="danger">
  Repeatable parameters must not be followed by any other parameter, i.e. they must be the last parameter.
</p>

###### Literal Values
Literal parameters will take the value of the input verbatim. You can define literals by appending an ellipsis (`...`) to the parameter name.

```
literalParam... : I am a literal.
```

When the user calls this command, the literal argument takes the value of everything after the command name. For instance,

```
@client echo one two three
```

will generate a single argument: `'one two three'`.

<p class="danger">
  Literal parameters may only be used when they are the only parameter in a command.
</p>

##### Defining Parameters as Objects
Object literal definitions are essentially a superset of string definitions. They share the same options though you must specify them as key/value pairs.

```js
{
  name: 'param',
  description: 'An object literal parameter definition.',
  optional: true,
  type: 'int',
  defaultValue: 0, // provide an array of values for repeatable parameters
  repeatable: false,
  literal: false,
}
```

String and object literal definitions can be freely mixed together, so you might opt to use object literals only as required.

#### Defining a Handler
It's time to dive deeper into actually building a command handler. There are a couple of things which are of importance here, namely **context** and **response types**.

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
The parsed command arguments as specified in the command's `parameters` configuration option. These arguments are parsed from the message according to their type. Arguments must be named, so they can be referenced directly via `context.args.name`.

###### `context.client`
A reference to the Ghastly client. This is just a convenience property, since the client is also available via `context.message`.

###### `context.commands`
The dispatcher's command registry.

###### `context.services`
The client's service registry.

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

Array elements can be any valid response type; the selected response will be recursively dispatched. For instance, you could even have an array of arrays to group responses into random "buckets".

```js
function handler() {
  return [
    [
      'Cat',
      'Lion',
      'Leopard',
    ],
    [
      'Dog',
      'Wolf',
      'Fox',
    ],
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

Note that returning a falsey value will cause Ghastly to take no response action. Custom responses are useful for complex response flows, but they don't fit well with the concept of responses being values. That's why Ghastly provides the `CustomResponse` class and several specialized types with self-contained logic for [sending more complicated responses](#complex-response-types).

## Advanced
### Complex Response Types
In addition to the basic response types, Ghastly provides more complex response handling through the `CustomResponse` class. `CustomResponse` is simply a wrapper for specialized response logic. This allows you to return an instance of a `CustomResponse` instead of coding a custom response in your handler. Not only does this keep responses contained as values, but it also enables you to modularize your response logic and reuse it across several handlers.

#### Using `CustomResponse`
The `CustomResponse` constructor takes a single **executor** function. The executor receives a context object; this context will be the same as the context passed to the command handler from which the `CustomResponse` is returned\*. The executor may be `async`, and must handle all of the response logic.

In general, it's a good idea to extend the `CustomResponse` class and create your own specialized response classes rather than directly instantiating a new `CustomResponse` in your command handler (otherwise what's the point in using it?).

```js
import { CustomResponse } from 'ghastly';

class ReversedResponse extends CustomResponse {
  constructor() {
    super(({ message }) => {
      const reversed = message.content.split('').reverse().join('');

      return message.channel.sendMessage(reversed);
    });
  }
}

function handler() {
  return new ReversedResponse();
}
```

<p class="warning">
  \* The context passed to the executor is actually a **shallow copy** of the context that the command handler receives. As such, it is possible for the context to differ if the command handler mutates some non-primitive property of the context object before returning.
</p>

#### Builtin Responses
Of course, it's a pain to have to define your own response logic for simple things that are absent from the basic response types, so Ghastly provides a set of `CustomResponse` classes to handle some of the more common cases.

##### Code Blocks
You can send a multi-line code block using `CodeResponse`.

```js
import { CodeResponse } from 'ghastly';

function handler() {
  const response = new CodeResponse('js', `console.log('Hello, world');
console.log(2 + 2);`);

  return response;
}
```

##### Voice Responses
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

#### Defining Middleware
In order to define your own custom middleware, simply create a higher order function which returns the middleware function. We will call this function a middleware layer, or **layer** for short.

Layers receive two arguments: the `next` layer in the middleware chain, and the `context` object passed in by the previous layer. A layer has the power to continue the chain or exit it. By calling the `next` layer, the chain continues. Conversely, if the layer does not call `next`, the chain stops and no other layers are executed. The command handler function lies at the end of the middleware chain.

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
Since layers have direct access to the context object, they are able to read, write and even completely obliterate the context (though that's a stupid idea, so don't do it).

```js
function middlewareThatChangesProperties() {
  return (next, context) => {
    Object.keys(context).forEach((key) => {
      context[key] = 'I changed this!';
    });

    context.injectedProperty = 'I added this.';

    return next(context);
  };
}
```

One thing to be aware of is that the value returned from the command handler is not passed directly to any waiting layer. Instead, layers receive an object with a `response` property which contains the response value. This is essentially the reverse of the original context flow: the object is propagated from the innermost layer to the outermost layer. Consequently, any intercepting layer has the ability to interact with the response context as they see fit; the dispatcher only cares about the `response` property (in addition to some private properties injected by Ghastly, though you shouldn't be touching these in any case), so any additional properties will only be seen by the layers in the middleware chain.

##### Before and After Middleware
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

The returned value depends on the layer that's next in the chain. If there are no other layers left, the returned value is that of the command's handler function.

### Services
In some cases, you may find that your commands have external dependencies. For instance, a music client may depend on a queueing system to store information about which songs to play next. You may be tempted to simply store the queue somewhere your handler can reach:

```js
import { VoiceResponse } from 'ghastly';

// our magic music queue
const queue = new MusicQueue();

function playSong() {
  function handler() {
    const nextStream = queue.next();

    return new VoiceResponse('stream', nextStream);
  }

  return {
    handler,
    // ...
  };
}
```

However, this becomes ugly when you need to share the queue with other commands that also have a dependency on it (`addSong`, `removeSong`, etc.). Ghastly provides a centralized system to organize and fetch these dependencies via the `ServiceRegistry` interface.

#### Accessing the Service Registry
When you have access to the context object, a reference to the registry is automatically injected for you.

```js
function handler({ services }) {
  const queue = services.fetch('music:queue');
  const nextStream = queue.next();

  return new VoiceResponse('stream', nextStream);
}
```

Elsewhere, you can access the registry through `client.services`.

#### Binding Services
To bind a new service, use `services.bind()`.

```js
// bind the MusicQueue instance under a single name
client.services.bind('music:queue', new MusicQueue());

// bind the MusicQueue instance with an alias
client.services.bind(['music:queue', 'queue'], new MusicQueue());
```

<p class="warning">
  Every service binding is stored in the same namespace, so make sure you pick names that won't collide easily.
</p>

When you bind an instance as a service, the same instance is returned each time you fetch that service. In order to construct a new instance each time the service is fetched, you can bind a function instead.

```js
client.services.bind('music:queue', () => {
  const queue = new MusicQueue();

  // perform some queue initialization

  return queue;
});
```

#### Unbinding Services
To remove bindings, use `services.unbind()`.

```js
client.services.unbind('music:queue');
```

Unbinding a service will remove all aliases associated with that service.

#### Binding With Providers
Once you start binding a large number of services, it may be useful to take advantage of the **service provider** functionality. Providers are functions which bind a predefined selection of services to the service registry.

```js
function musicProvider({ registry }) {
  registry.bind('music:queue', new MusicQueue());
}
```

Providers receive the service registry as an argument. They may bind any number of services to the registry, though it's best to keep each provider focused on binding a specific group of services. To use a provider, you can pass the provider function to the registry's `bindProviders()` method, which accepts a variable number of providers.

```js
client.services.bindProviders(musicProvider);
```

#### Fetching Services
To retrieve a service from the registry, use the registry's `fetch()` method.

```js
const queue = client.services.fetch('music:queue');
```

If the requested service is not found, `null` is returned instead. If you wish to check that a service exists, you can use the `has()` method.

```js
client.services.has('music:queue'); // true
```

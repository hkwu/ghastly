# Guide
This section is a more in-depth dive into the Ghastly API. If you haven't already, you might want to finish reading the section on [getting started](/#getting-started) with Ghastly.

## Command Building
### The Client
At the core of the library is the Ghastly client. It provides a convenient interface to register commands and bind services.

```js
import { Client } from 'ghastly';

const client = new Client();
```

The Ghastly client is an extension of the Discord.js client, so any methods, properties and events are inherited by the Ghastly client, if you require them.

#### Setting a Prefix
The client processes messages using a component called the dispatcher. In order to take advantage of the dispatcher, you need to configure it when you create the client. The dispatcher filters messages based on a prefix. The prefix can be any string (spaces are valid), with specific exceptions as outlined below.

```js
const client = new Client({ prefix: '> ' });
```

<p class="warning">
  Since spaces are treated as part of the prefix, the above dispatcher will respond to messages of the form `> hello, world`, but will *not* respond to `>hello, world`.
</p>

##### Mentions
You can specify the client's mention as a prefix by using the special value `@client`. This is the recommended prefix as it's inherently unique.

```js
const client = new Client({ prefix: '@client' });
```

The dispatcher will now only respond to `@client#1234 messages like these`.

##### Selfbots
Selfbots can use the `@me` prefix to ignore all messages not originating from the client itself. You will also need to specify the actual message prefix by prepending it with a colon:

```js
const client = new Client({ prefix: '@me:/' });
```

You can then trigger selfbot commands by using `/command`.

#### Registering Commands
Commands should be registered before logging in with the client. The command registry (available through `client.commands`) provides the `add()` method to register commands. It takes a variable number of commands and adds them to the registry. The nature of these commands is detailed in the next section.

```js
client.commands.add(foo, bar, baz);
```

<p class="danger">
  `add()` does *not* take an array as an argument. In that case, you should use array spread to expand the array: `commands.add(...commands)`.
</p>

### Configurators
The main purpose of Ghastly is to ease the design and management of client commands. This allows you to avoid the boilerplate and/or spaghetti code that inevitably results when defining inline commands with the native Discord.js events system.

Ghastly doesn't export any base `Command` class; commands are defined as functions. This is meant to encourage stateless commands, which will help keep your code focused and easy to reason about.

```js
function ping() {
  async function handler() {
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

These functions must return a configuration object which describes the behaviour of the command. We'll call these functions command configurators, or **configurators** for short.

#### Command Configuration
This section will briefly describe what the configuration object should contain.

##### `handler`
The `handler` is a function that gets called when the command is triggered. It should contain the main logic for making a response based on the user input received from the client. We'll cover in more detail how handlers work later on.

```js
async function handler() {
  // returning a string sends it as a message
  return 'Hello, world!';
}

return {
  handler,
};
```

##### `triggers`
`triggers` is a non-empty array of strings. The first string is treated as the command's main name while any additional values are used as aliases for the command. Each trigger should be a unique value among every command.

```js
return {
  triggers: [
    'mainTrigger',
    'firstAlias',
    'secondAlias',
  ],
};
```

##### `parameters`
Your command may accept any number of parameters of various types. `parameters` is an array of parameter definitions.

```js
return {
  parameters: [
    // you can define parameters as a string
    'age : Your age.',
    // or as an object
    {
      name: 'height',
      description: 'Your height.',
    },
  ],
};
```

[Read more](#command-parameters) about command parameters.

##### `group`
Commands can optionally be tagged with a certain group to make it easier to manage multiple commands at once.

```js
return {
  group: 'admin',
};
```

Note that command groups do not function as a namespace for commands, so two commands in different groups will still need to have unique triggers.

##### `description`
The `description` is an optional string which describes the command's function and is only stored for your own use (useful if you're making a `help` command, for instance).

```js
return {
  description: 'Fetches weather data.',
};
```

##### `middleware`
You can also define middleware for your commands. Middleware are simply functions which wrap the command handler and provide an easy, modular way to extend command handler functionality.

The `middleware` option is an array of middleware that will be applied to the command's handler function. Middleware are executed in the order they're defined in the `middleware` array.

```js
return {
  middleware: [
    first(),
    second(),
  ],
};
```

If you're not familiar with the concept of middleware, it's useful to think of them as layers stacked on top of the command handler. Each layer can intercept and potentially alter what gets sent into the next layer. We will cover middleware usage and the process of creating your own middleware in [another section](#middleware1).

### Command Parameters
The parameter system in Ghastly allows you to specify user inputs for your commands. All parameters are defined within the `parameters` array in your configurator options.

There are two different ways to define parameters: as strings or as object literals. Object literals have more flexibility and power, but strings are more fluent and easier to read.

#### Defining Parameters as Strings
The most basic parameters require only a name. The parameter name is used as a key when passing arguments to the command handler.

```js
return {
  parameters: [
    'param',
  ],
};
```

This defines a parameter with the name `param`. The value of this parameter will be passed to the command handler as `args.param`.

##### Description
Similarly to commands, you can add a description to your parameter.

```
param : This is a parameter description.
```

##### Optional Parameters
Optional parameters are identified by a leading `-` character.

```
- optionalParam : This is an optional parameter.
```

##### Parameter Types
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

##### Default Values
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

##### Repeatable Values
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

##### Literal Values
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

#### Defining Parameters as Objects
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

### Command Handlers
Ghastly command handlers carry the majority of the responsibility of reacting to commands and executing response logic. The general idea behind command handlers is quite simple: they consume some data and produce a response. Ghastly makes this process more convenient to handle by stripping away the need to deal with the underlying Discord.js API and automatically preprocessing data such as command arguments into a more user friendly form.

#### Context
The handler receives a `context` object as its only argument. The context contains useful data such as references to the received message and arguments that were parsed from the command.

##### `message`
The Discord.js `Message` object representing the message which triggered the command.

```js
async function handler({ message }) {
  console.log(message.content);
}
```

##### `args`
The parsed command arguments as specified in the command's `parameters` configuration option. These arguments are parsed from the message according to their type. Arguments must be named, so they can be referenced directly via `context.args.name`.

```js
async function handler({ args }) {
  Object.entries(args).forEach(([key, value]) => {
    console.log(`Got argument: ${key}, ${value}`);
  });
}
```

##### `client`
A reference to the Ghastly client. This is just a convenience property, since the client is also available via `context.message.client`.

##### `dispatch`
The dispatch helper function. It allows the handler to generate a response action from a value. We'll come back to this in a bit.

##### `commands`
The client's [command registry](#command-registry). Contains methods for managing commands.

##### `services`
The client's [service container](#services). Ghastly services are similar in spirit to services in other frameworks such as Angular or Laravel, providing a central place to retrieve and store command dependencies.

##### `formatter`
The `MarkdownFormatter` utility class. Contains useful methods for composing Markdown within text.

Sample usage:

```js
async function handler({ formatter }) {
  const { italic, bold } = formatter;

  return `To ${bold('boldly')} go where no ${italic('man')} has gone before.`;
}
```

For a detailed method list, check the [MarkdownFormatter](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/utils/MarkdownFormatter.js~MarkdownFormatter.html) entry in the API reference.

#### Basic Response Types
Handlers don't actually need to interact with the Discord.js `Message` object in order to send responses. Ghastly can evaluate the return value of handlers and automate the response process based on the returned value's type. This helps to decouple your handler implementations from the underlying messaging API, letting you concentrate on *what* your handlers should respond with, rather than *how* they should respond.

<p class="tip">
  Although synchronous handler functions are supported, `async` functions make it much easier to work with a promise-based control flow. As such, it's highly recommended that you define all your handlers as `async` functions.
</p>

<p class="tip">
  Unless otherwise stated, responses will be sent to the channel from which the triggering message originated.
</p>

##### Strings
You can return a string to dispatch a plain text response. The text returned will be sent verbatim, so you can embed things such as Markdown, emoji codes or mentions directly (just make sure they're in raw form as required by the Discord API).

```js
async function handler() {
  return 'Check out this `code` it is absolutely **fabulous**';
}
```

##### Arrays
Return an array to have Ghastly randomly select one of the array elements as the response to dispatch.

```js
async function handler() {
  return [
    'Will it be me?',
    'Or me?',
    'No, me!',
  ];
}
```

Array elements can be any valid response type; the selected response will be recursively dispatched. For instance, you could even have an array of arrays to group responses into random "buckets".

```js
async function handler() {
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

##### Embeds
Return a Discord.js `RichEmbed` object to dispatch an embed.

```js
import { RichEmbed } from 'discord.js';

async function handler() {
  const embed = new RichEmbed();

  embed.setTitle('My Embed')
    .setDescription('Just a small test.')
    .setTimestamp()
    .setFooter('Tiny footer text.');

  return embed;
}
```

##### Manual Responses
You can always elect to handle the message dispatching on your own.

```js
async function handler({ message }) {
  message.channel.send('My message!');
}
```

Note that returning a falsey value will cause Ghastly to take no response action. Manual responses are useful if you have highly customized response logic, but you should try to avoid this as much as possible since it's more verbose and doesn't fit well with the declarative nature of command handlers. In fact, Ghastly has a couple of helpful features to deal with these situations in a more declarative fashion: the `dispatch()` function and the `Response` class.

#### The `dispatch()` Function
Response types are great for responding with a single message, but what if we want to send multiple response types in the same handler? For instance, commands which query third party services such as a weather API may take several seconds to complete. In order to improve the user experience, it's often best to dispatch a message prior to making an asynchronous request to inform the user that there may be a delay.

Unfortunately, the response flow we just described is simply not possible with what we've seen so far. You can't return more than one value from a function, so you'll be stuck with dispatching responses manually (what a pain!).

In order to facilitate response flows which dispatch multiple times, Ghastly injects the `dispatch()` helper into your handler's context.

```js
async function handler({ dispatch }) {
  await dispatch('Hello, world!');

  return 'H31l0 w0r1d 2.0';
}
```

The `dispatch()` helper accepts any valid response type, dispatches it and returns a promise. The promise resolves once the dispatch is complete or rejects if there was an error during the dispatch process.

```js
async function handler({ dispatch }) {
  try {
    await dispatch(new Error('This should fail.'));
  } catch (error) {
    console.error(error);
  }
}
```

The value that the promise resolves to depends on the type of response dispatched. For strings and embeds, the promise resolves to a Discord.js `Message`.

```js
async function handler({ dispatch }) {
  const message = await dispatch('boo');

  console.log(message.channel.id);
}
```

For arrays, the promise resolves to the value of `dispatch(choice)` where `choice` is the randomly chosen value in the array.

```js
async function handler({ dispatch }) {
  const message = await dispatch([
    'boo',
    'foo',
    'zoo',
  ]);

  console.log(message.content);
}
```

#### Complex Response Types
In addition to the basic response types, Ghastly provides more complex response handling through the `Response` class. `Response` is simply a wrapper for specialized response logic; this allows you to return an instance of a `Response` instead of coding a custom response in your handler. Not only does this keep responses contained as values, but it also enables you to modularize your response logic and reuse it across several handlers.

##### Creating Custom Types
The `Response` constructor takes a single **executor** function. The executor receives a context object; this context will be the same as the context passed to the command handler from which the `Response` is returned\*. The executor may be `async`, and must handle all of the response logic (including the response dispatching).

In general, it's a good idea to extend the `Response` class and create your own specialized response classes rather than directly instantiating a new `Response` in your command handler (otherwise what's the point in using it?).

```js
import { Response } from 'ghastly/command';

class ReversedResponse extends Response {
  constructor() {
    super(async ({ message }) => {
      const reversed = message.content.split('').reverse().join('');

      return message.channel.send(reversed);
    });
  }
}

async function handler() {
  return new ReversedResponse();
}
```

When using `dispatch()` on `Response` objects, the returned promise resolves to the return value of the executor.

```js
async function handler({ dispatch }) {
  const message = await dispatch(new ReversedResponse());
}
```

<p class="warning">
  \* The context passed to the executor is actually a **shallow copy** of the context that the command handler receives. As such, it is possible for the context to differ if the command handler mutates some non-primitive property of the context object before returning.
</p>

##### Builtins
Of course, it's a pain to have to define your own response logic for simple things that are absent from the basic response types, so Ghastly provides a set of `Response` classes to handle some of the more common cases.

###### Voice Responses
You can send an audio response to the voice channel the client is currently connected to using `VoiceResponse`. A response will be sent only if the message is received in a guild context. In addition, the client must be connected to a voice channel in that guild. In any other case, the response is ignored.

```js
import ytdl from 'ytdl-core';
import { VoiceResponse } from 'ghastly/command';

async function handler() {
  const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });

  // must be connected to voice channel at this point
  return new VoiceResponse('stream', stream);
}
```

The `VoiceResponse` constructor is designed to be a thin facade over the Discord.js `VoiceConnection` play methods.

```js
// play a file
const fileResponse = new VoiceResponse('file', '/path/to/file.mp3');

// send in StreamOptions
const fileResponseWithOptions = new VoiceResponse('file', 'path/to/file.mp3', { volume: 0.5 });
```

The `VoiceResponse` executor returns a promise resolving to the [StreamDispatcher](https://discord.js.org/#/docs/main/stable/class/StreamDispatcher) returned by the `VoiceConnection` play method. If you need to access the `StreamDispatcher`, you will need to `dispatch()` the `VoiceResponse` instead of returning it:

```js
async function handler({ dispatch }) {
  const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });

  // we can access the dispatcher now
  const dispatcher = await dispatch(new VoiceResponse('stream', stream));
}
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
In order to define your own custom middleware, simply create a higher order function which returns the `async` middleware function. We will call this function a middleware layer, or **layer** for short.

Layers receive two arguments: the `next` layer in the middleware chain, and the `context` object passed in by the previous layer. A layer has the power to continue the chain or exit it. By calling the `next` layer, the chain continues. Conversely, if the layer does not call `next`, the chain stops and no other layers are executed. The command handler function lies at the end of the middleware chain.

```js
function loggingMiddleware() {
  return async (next, context) => {
    console.log('Current context:');
    console.log(context);

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
Since layers have direct access to the context object, they are able to read, write and even completely obliterate the context.

```js
function middlewareThatChangesProperties() {
  return async (next, context) => {
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
  return async (next, context) => {
    doSomething(context);

    return next(context);
  };
}
```

Whereas this middleware will delegate and wait for the return value of the next layer before executing its own logic.

```js
function after() {
  return async (next, context) => {
    const returned = await next(context);

    doSomething(returned);

    return returned;
  };
}
```

The returned value depends on the layer that's next in the chain. If there are no other layers left, the returned value is that of the command's handler function.

#### Builtins
Ghastly comes equipped with several convenience middleware. You can access these as named exports from `ghastly/middleware`:

```js
import { expectPermissions } from 'ghastly/middleware';
```

##### Filters
Filter middleware are intended to block messages based on certain restrictions. They can be useful to prevent command abuse.

###### `expectDM()`
`expectDM()` blocks a message if it isn't received in a direct message channel.

###### `expectGroupDM()`
`expectDM()` blocks a message if it isn't received in a group direct message channel.

###### `expectGuild()`
`expectGuild()` blocks a message if it isn't received in a guild text channel.

###### `expectPermissions()`
`expectPermissions()` blocks a message if a user does not have all of the specified permissions.

```js
expectPermissions(
  'KICK_MEMBERS',
  'BAN_MEMBERS',
);
```

###### `expectRole()`
`expectRole()` blocks a message if the user does not have any of the specified roles. Role IDs and names are accepted.

```js
expectRole(
  '451517041536222613',
  'The Rock',
);
```

<p class="warning">
  Keep in mind that role names are non-unique so the filter may not behave as expected when identical names exist.
</p>

###### `expectUser()`
`expectUser()` blocks a message if it didn't come from any of the specified users. User IDs and username/discriminator combos (the kind you see after typing a mention) are accepted.

```js
expectUser(
  '513412460316527251',
  'The Rock#5555',
  'RainbowFiend#9386',
);
```

### Command Groups
You can define groups to organize commands by providing the `group` option in your configurator.

```js
return {
  group: 'admin',
};
```

Command groups allow you to organize and configure multiple commands in a more convenient fashion.

#### Group Middleware
Groups allow us to define middleware that will be applied to multiple commands. Group middleware function identically to the middleware you define in individual configurators. To add middleware to a group, use the `applyGroupMiddleware()` method on the command registry:

```js
import { expectGuild } from 'ghastly/middleware';

client.commands.applyGroupMiddleware('admin', [
  expectGuild(),
]);
```

Group middleware will be inserted before the first layer of each command's middleware chain. This gives group middleware the privilege of handling the context object before passing it to any other layers down the line.

## Client Components
### Command Registry
The client stores commands in a [CommandRegistry](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/CommandRegistry.js~CommandRegistry.html). You can access the registry as an injected context property or as `client.commands`:

```js
async function handler({ commands }) {
  const ping = commands.get('ping');
}
```

#### Using the Command Registry
The registry provides several methods for managing commands.

##### Adding a Command
To add a command, use `commands.add()`, providing any number of configurators as arguments:

```js
client.commands.add(ping, weather, food, sports);
```

##### Retrieving a Command
To retrieve a command, use `commands.get()`, providing any of the command's triggers as an argument:

```js
client.commands.get('ping');
```

The retrieved command will be a [CommandObject](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/CommandObject.js~CommandObject.html) instance.

<p class="danger">
  When retrieving commands, a *reference* to the `CommandObject` is returned. Since Ghastly relies on the registry internally, you should **never** mutate the returned `CommandObject`.
</p>

##### Adding Group Middleware
To add middleware to a command group, use `commands.applyGroupMiddleware()`, providing the command group name and an array of layers to apply:

```js
import { expectGuild } from 'ghastly/middleware';

client.commands.applyGroupMiddleware('music', [
  expectGuild(),
]);
```

### Services
In some cases, you may find that your commands have external dependencies. For instance, a music client may depend on a queueing system to store information about which songs to play next. You may be tempted to simply store the queue somewhere your handler can reach:

```js
import { VoiceResponse } from 'ghastly/command';

// our magic music queue
const queue = new MusicQueue();

function playSong() {
  async function handler() {
    const nextStream = queue.next();

    return new VoiceResponse('stream', nextStream);
  }

  // ...
}
```

However, this becomes ugly when you need to share the queue with other commands that also have a dependency on it (`addSong`, `removeSong`, etc.). Ghastly provides a centralized system to organize and fetch these dependencies via the [ServiceContainer](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/client/services/ServiceContainer.js~ServiceContainer.html) interface.

When you have access to the context object, a reference to the container is automatically injected for you.

```js
async function handler({ services }) {
  const queue = services.get('music.queue');
  const nextStream = queue.next();

  return new VoiceResponse('stream', nextStream);
}
```

Elsewhere, you can access the container through `client.services`.

#### Using the Service Container
The service container provides several methods for binding and retrieving services.

##### Binding Constructed Services
Constructed services are services which are rebuilt each time they're fetched from the service container. To bind a new constructed service, use `services.construct()`. You must provide a name for the service in addition to a function which constructs and returns that service.

```js
// bind the MusicQueue instance under a single name
client.services.construct('music.queue', () => new MusicQueue());

// bind the MusicQueue instance with an alias
client.services.construct(['music.queue', 'queue'], () => new MusicQueue());
```

<p class="warning">
  Every service binding is stored in the same namespace, so make sure you pick names that won't collide easily.
</p>

##### Binding Singletons
In order to construct a service once and reuse the constructed service on subsequent fetches, use the `singleton()` method.

```js
client.services.singleton('music.queue', () => {
  const queue = new MusicQueue();

  // perform some queue initialization

  return queue;
});
```

##### Binding Instances
If you wish to bind a previously constructed service, use the `instance()` method.

```js
const queue = new MusicQueue();

client.services.instance('music.queue', queue);
```

##### Unbinding Services
To remove bindings, use `services.unbind()`.

```js
client.services.unbind('music.queue');
```

Unbinding a service will remove all aliases associated with that service.

##### Binding Services with Providers
Once you start binding a large number of services, it may be useful to take advantage of the **service provider** functionality. Providers are functions which bind a predefined selection of services to the service container.

```js
function musicProvider({ container }) {
  container.instance('music.queue', new MusicQueue());
}
```

Providers receive the service container as an argument. They may bind any number of services to the container, though it's best to keep each provider focused on binding a specific group of services. To use a provider, you can pass the provider function to the container's `bindProviders()` method, which accepts a variable number of providers.

```js
client.services.bindProviders(musicProvider);
```

##### Checking If a Service Exists
If you wish to check that a service exists, you can use the `has()` method.

```js
client.services.has('music.queue'); // true
```

##### Fetching Services
To retrieve a service from the container, use the `get()` method.

```js
const queue = client.services.get('music.queue');
```

If the requested service is not found, `null` is returned instead. 

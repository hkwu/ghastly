# Command Handlers
Ghastly command handlers carry the majority of the responsibility of reacting to commands and executing response logic. The general idea behind command handlers is quite simple: they consume some data and produce a response. Ghastly makes this process more convenient to handle by stripping away the need to deal with the underlying Discord.js API and automatically preprocessing data such as command arguments into a more user friendly form.

## Context
The handler receives a `context` object as its only argument. The context contains useful data such as references to the received message and arguments that were parsed from the command.

### message
The Discord.js `Message` object representing the message which triggered the command.

```js
async function handler({ message }) {
  console.log(message.content);
}
```

### args
The parsed command arguments as specified in the command's `parameters` configuration option. These arguments are parsed from the message according to their type. Arguments must be named, so they can be referenced directly via `context.args.name`.

```js
async function handler({ args }) {
  Object.entries(args).forEach(([key, value]) => {
    console.log(`Got argument: ${key}, ${value}`);
  });
}
```

### client
A reference to the Ghastly client. This is just a convenience property, since the client is also available via `context.message.client`.

### dispatch
The dispatch helper function. It allows the handler to generate a response action from a value. We'll come back to this in a bit.

### commands
The client's [command registry](#command-registry). Contains methods for managing commands.

### services
The client's [service container](#services). Ghastly services are similar in spirit to services in other frameworks such as Angular or Laravel, providing a central place to retrieve and store command dependencies.

### formatter
The `MarkdownFormatter` utility class. Contains useful methods for composing Markdown within text.

Sample usage:

```js
async function handler({ formatter }) {
  const { italic, bold } = formatter;

  return `To ${bold('boldly')} go where no ${italic('man')} has gone before.`;
}
```

For a detailed method list, check the [MarkdownFormatter](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/utils/MarkdownFormatter.js~MarkdownFormatter.html) entry in the API reference.

## Basic Response Types
Handlers don't actually need to interact with the Discord.js `Message` object in order to send responses. Ghastly can evaluate the return value of handlers and automate the response process based on the returned value's type. This helps to decouple your handler implementations from the underlying messaging API, letting you concentrate on *what* your handlers should respond with, rather than *how* they should respond.

?> Although synchronous handler functions are supported, `async` functions make it much easier to work with a promise-based control flow. As such, it's highly recommended that you define all your handlers as `async` functions.

?> Unless otherwise stated, responses will be sent to the channel from which the triggering message originated.

### Strings
You can return a string to dispatch a plain text response. The text returned will be sent verbatim, so you can embed things such as Markdown, emoji codes or mentions directly (just make sure they're in raw form as required by the Discord API).

```js
async function handler() {
  return 'Check out this `code` it is absolutely **fabulous**';
}
```

### Arrays
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

### Embeds
Return a Discord.js `RichEmbed` object to dispatch an embed.

```js
const { RichEmbed } = require('discord.js');

async function handler() {
  const embed = new RichEmbed();

  embed.setTitle('My Embed')
    .setDescription('Just a small test.')
    .setTimestamp()
    .setFooter('Tiny footer text.');

  return embed;
}
```

### Manual Responses
You can always elect to handle the message dispatching on your own.

```js
async function handler({ message }) {
  message.channel.send('My message!');
}
```

Note that returning a falsey value will cause Ghastly to take no response action. Manual responses are useful if you have highly customized response logic, but you should try to avoid this as much as possible since it's more verbose and doesn't fit well with the declarative nature of command handlers. In fact, Ghastly has a couple of helpful features to deal with these situations in a more declarative fashion: the `dispatch()` function and the `Response` class.

## The dispatch() Function
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

## Complex Response Types
In addition to the basic response types, Ghastly provides more complex response handling through the `Response` class. `Response` is simply a wrapper for specialized response logic; this allows you to return an instance of a `Response` instead of coding a custom response in your handler. Not only does this keep responses contained as values, but it also enables you to modularize your response logic and reuse it across several handlers.

### Creating Custom Types
The `Response` constructor takes a single **executor** function. The executor may be `async`, and must handle all of the response logic (including the response dispatching).

In general, it's a good idea to extend the `Response` class and create your own specialized response classes rather than directly instantiating a new `Response` in your command handler (otherwise what's the point in using it?).

```js
const { Response } = require('ghastly/command');

class ReversedResponse extends Response {
  constructor({ dispatch, message }) {
    super(async () => {
      const reversed = message.content.split('').reverse().join('');

      return dispatch(reversed);
    });
  }
}

async function handler(context) {
  return new ReversedResponse(context);
}
```

?> You often need to access the handler's context in custom responses. A simple pattern you can employ is to pass it to your response as a constructor argument. All custom responses included with Ghastly follow this convention.

When using `dispatch()` on `Response` objects, the returned promise resolves to the return value of the executor.

```js
async function handler(context) {
  const { dispatch } = context;
  const message = await dispatch(new ReversedResponse(context));
}
```

### Builtins
Of course, it's a pain to have to define your own response logic for simple things that are absent from the basic response types, so Ghastly provides a set of `Response` classes to handle some of the more common cases.

#### Voice Responses
You can send an audio response to the voice channel the client is currently connected to using one of the voice response types. A response will be sent only if the message is received in a guild context. In addition, the client must be connected to a voice channel in that guild. In any other case, the response is ignored.

```js
const ytdl = require('ytdl-core');
const { StreamVoiceResponse } = require('ghastly/command');

async function handler(context) {
  const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });

  // must be connected to voice channel at this point
  return new StreamVoiceResponse(context, stream);
}
```

There are six voice response types, each corresponding to a [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection) audio input method:

- [ArbitraryVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/ArbitraryVoiceResponse.js~ArbitraryVoiceResponse.html)
- [BroadcastVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/BroadcastVoiceResponse.js~BroadcastVoiceResponse.html)
- [ConvertedVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/ConvertedVoiceResponse.js~ConvertedVoiceResponse.html)
- [FileVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/FileVoiceResponse.js~FileVoiceResponse.html)
- [OpusVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/OpusVoiceResponse.js~OpusVoiceResponse.html)
- [StreamVoiceResponse](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/responses/StreamVoiceResponse.js~StreamVoiceResponse.html)

Voice responses act as a thin facade over these methods.

```js
// play a file
const fileResponse = new FileVoiceResponse(context, '/path/to/file.mp3');

// send in StreamOptions
const fileResponseWithOptions = new FileVoiceResponse(context, 'path/to/file.mp3', { volume: 0.5 });
```

Voice response executors return a promise resolving to the [StreamDispatcher](https://discord.js.org/#/docs/main/stable/class/StreamDispatcher) returned by the `VoiceConnection` play method. If you need to access the `StreamDispatcher`, you will need to `dispatch()` the `VoiceResponse` instead of returning it:

```js
async function handler(context) {
  const { dispatch } = context;
  const stream = ytdl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { filter: 'audioonly' });

  // we can access the dispatcher now
  const dispatcher = await dispatch(new StreamVoiceResponse(context, stream));
}
```

# The Client
At the core of the library is the Ghastly client. It provides a convenient interface to register commands and bind services.

```js
const { Client } = require('ghastly');

const client = new Client();
```

The Ghastly client is an extension of the Discord.js client, so any methods, properties and events are inherited by the Ghastly client if you require them.

## Setting a Prefix
The client processes messages using a component called the dispatcher. In order to take advantage of the dispatcher, you need to configure it when you create the client. The dispatcher filters messages based on a prefix. The prefix can be any string (spaces are valid), with specific exceptions as outlined below.

```js
const client = new Client({ prefix: '> ' });
```

?> Since spaces are treated as part of the prefix, the above dispatcher will respond to messages of the form `> hello, world`, but will *not* respond to `>hello, world`.
Also be aware that all **string** prefixes are **case-insensitive**.

### Mentions
You can specify the client's mention as a prefix by using the special value `@client`. This is the recommended prefix as it's inherently unique.

```js
const client = new Client({ prefix: '@client' });
```

The dispatcher will now only respond to `@client#1234 messages like these`.

### Selfbots
Selfbots can use the `@me` prefix to ignore all messages not originating from the client itself. You will also need to specify the actual message prefix by prepending it with a colon:

```js
const client = new Client({ prefix: '@me:/' });
```

You can then trigger selfbot commands by using `/command`.

### Regular Expressions
You can also specify prefixes using a regular expression.

```js
const client = new Client({ prefix: /hey, there */ });
```

This prefix will match any message starting with the string `hey, there`, followed by any number of spaces. Note that the prefix is **case-sensitive** unless you explicitly add the `i` flag to the regular expression.

### Deferred Prefixes
In some special cases, you may require some additional information at runtime to determine which prefix to use. For instance, you may wish to implement guild-based prefixes by checking which guild context a message was received in, then returning a prefix which is unique to that guild.

This is possible by specifying a function as a prefix.

```js
const client = new Client({
  prefix: (message) => {
    // assume `Prefixes` is a mapping between guilds and their unique prefixes
    return message.guild && new RegExp(Prefixes.get(message.guild.id));
  },
});
```

Deferred prefixes receive the `Message` as an argument and should return a `RegExp` object which specifies the message prefix, or a `Promise` which resolves to a `RegExp`.

If the prefix returns a falsey value, the message is ignored and will not be processed further. This allows you to perform additional filtering independent of the message content.

## Registering Commands
Commands should be registered before logging in with the client. The command registry (available through `client.commands`) provides the `add()` method to register commands. It takes a variable number of commands and adds them to the registry. The nature of these commands is detailed in the next section.

```js
client.commands.add(foo, bar, baz);
```

!> `add()` does *not* take an array as an argument. Instead, you should use the spread operator to expand the array: `commands.add(...commands)`.

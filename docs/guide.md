# The Ghoulish Guide
This is a simple walkthrough guide which touches upon most of the library features.

## Part I: Introduction
Let's make a simple Ghastly bot.

### Setting up
Time to do the boilerplate. First, our imports. Grab the `Client` and `Dispatcher` classes.

```js
const { Client, Dispatcher } = require('ghastly');
```

Our `Dispatcher` will handle command registration and message responses, so let's create one of those first.

```js
const dispatcher = new Dispatcher({ prefix: '@self' });
```

The `Dispatcher` constructor takes an object with a `prefix` configuration option. The `prefix` will be used to filter messages when deciding who to respond to. The `prefix` can be any string, but some are treated as special values such as `'@self'`. `'@self'` tells Ghastly to use its own mention as a prefix.

The `Client` class extends the regular Discord.js client, so all the methods available to it are also available in the Ghastly client. The bulk of the setup revolves around the dispatcher, though, so we'll just leave it there for now.

### Making commands
In Ghastly, commands are defined as functions. This is what they look like:

```js
function ping() {
  const handler = () => 'Pong!';

  return {
    handler,
    triggers: [
      'ping',
    ],
    description: 'Replies with a ping.',
  };
}
```

Let's break down this command definition.

```js
const handler = () => 'Pong!';
```

The **Handler** is the function which processes the command and its user-supplied arguments. In this case, we're simply replying with a short message. Ghastly takes the return value of the handler function and uses it to determine how to respond. We'll go over the other types of responses later, but for now just remember that returned strings are sent back verbatim to the channel the message was received from.

```js
return {
  handler,
  triggers: [
    'ping',
  ],
  description: 'Replies with a ping.',
};
```

The command function should return an object containing its configuration data. The important ones for this command are the handler function and the `triggers` array. The `description` is optional and we'll see how it's used later on, but it won't hurt to include it here.

Back to the `triggers` array. A command can have multiple triggers, but the first trigger in the array is considered the *primary* trigger. It becomes the unique identifier for the command. Any other triggers are optional and become aliases for the primary trigger.

With that, our command function should be good.

### Registering commands
Let's load our command into the dispatcher.

```js
dispatcher.loadCommands(ping);
```

That's literally it.

<p class="tip">
  As its name suggests, `loadCommands()` can actually take any number of commands as arguments.
</p>

### Linking the dispatcher
As the final step, we need to register the dispatcher with the client so that it intercepts and handles incoming message events.

First, create the client.

```js
const client = new Client();
```

The Ghastly client takes the same options as the regular Discord.js client constructor. Once that's done, tell the client to `use()` the dispatcher. Then it'll be ready to login and start responding to messages.

```js
client.use(dispatcher).login('token');
```

### Code snippet
Here is the complete code snippet for this section:

```js
const { Dispatcher, Client } = require('ghastly');

const dispatcher = new Dispatcher({ prefix: '@self' });

function ping() {
  const handler = () => 'Pong!';

  return {
    handler,
    triggers: [
      'ping',
    ],
    description: 'Replies with a ping.',
  };
}

dispatcher.loadCommands(ping);

const client = new Client();

client.use(dispatcher).login('token');
```

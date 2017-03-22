# Getting Started
This guide will walk through building a basic client using Ghastly.

## Part I
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

*Wow, that's it? Where are we even sending a response?*

Handler functions have a specific purpose in Ghastly: they consume a received message and produce a response value. There's no need to actually use a `send()` method directly; Ghastly already does that for you.

Now that our command is set up, we need to register it with the client. 

*Hold on, what client?*

Right. Let's grab it.

```js
import { Client } from 'ghastly';

const client = new Client({ prefix: '!' });
```

*Whoa, I don't recognize that option!*

That's a Ghastly-specific client option, but the Ghastly client extends the Discord.js client so you can pass in any of the regular options as needed. The `prefix` will filter out messages that aren't prefixed by that value. Prefixes can include spaces, too, so you could use something like `hey siri` as a prefix.

Now that our client is instantiated, we can start registering commands on the client's dispatcher.

```js
client.dispatcher.loadCommands(helloWorld);
```

*Why is it plural when you're only loading one command?*

Because it accepts any number of commands: `loadCommands(a, b, c, ...)`.

Once our commands are loaded, we can `login()` with the client and test it out.

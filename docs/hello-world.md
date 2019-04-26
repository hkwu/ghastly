# Hello, world
Let's walk through the basics of Ghastly using the most appropriate exercise: a "Hello, world" command. To create a command, we define a function (called a **configurator**) which returns an object. This object needs two properties to work properly: a `handler` function to generate a response and a set of `triggers` which determine when a command is dispatched. With that in mind, take a peek at our "Hello, world" command below.

```js
function helloWorld() {
  async function handler() {
    return 'world!';
  }

  return {
    handler,
    triggers: ['hello'],
  };
}
```

Notice how we didn't even need to touch a [Message](https://discord.js.org/#/docs/main/stable/class/Message) object. Handler functions have a specific purpose in Ghastly: they consume a received message and produce a response value. There's no need to actually use a `send()` method directly; Ghastly already does that for you.

Our bot will now listen for messages starting with `hello` and promptly respond with `world!`. This is great, though it does pose a problem since we'll be rather trigger happy with messages that weren't necessarily directed at us.

To solve that problem, we'll pass in the Ghastly-specific `prefix` option to the client constructor. This will make Ghastly ignore messages that don't start with the given prefix, so instead of responding to `hello`, we'll respond to `!hello`. Prefixes can include spaces, too, so you could also use something like `hey siri` as a prefix.

```js
const { Client } = require('ghastly');

const client = new Client({ prefix: '!' });
```

?> The Ghastly client actually extends the Discord.js client, so if you need to pass in any `ClientOptions`, now would be the time.

Now that our client is instantiated, we can start registering commands.

```js
client.commands.add(helloWorld);
```

Once our command is loaded, we can `login()` with the client and test it out.

<div align="center">
  <img src="/assets/readme/hello-world.png">
</div>

<div align="center">
  <a href="https://ghastly.js.org" target="_blank"><img src="/assets/logo.png"></a>
  <h1>Ghastly</h1>
  <a href="https://www.npmjs.com/package/ghastly"><img src="https://img.shields.io/npm/v/ghastly.svg?style=flat-square" alt="npm"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/ghastly.svg?style=flat-square" alt="license"></a>
</div>

## Introduction
Ghastly is a modular command library built for Discord.js bots. It provides a powerful but flexible API which abstracts away boilerplate and makes command building a more elegant process.

## Installation
Ghastly is available through [npm](https://www.npmjs.com/package/ghastly).

```bash
npm install --save ghastly
```

or

```bash
yarn add ghastly
```

You should also install Discord.js v11 if you haven't already. This library requires Node.js >=7. For Node.js <7.6, you must start your application using `node --harmony` in order to enable support for `async` functions.

## Getting Started
### Foreword
This documentation assumes that you have a basic grasp of the Discord.js API. If not, it would be a good idea to [familiarize yourself](https://discord.js.org/#/) with it prior to building a bot with Ghastly.

It would also be helpful to be comfortable with ES2015+ features such as promises and `async` functions.

### Hello, world
Let's walk through the basics of Ghastly using the most appropriate exercise: a "Hello, world" command. To create a command, we define a function (call it a **configurator**) which returns an object. This object needs two properties to work properly: a `handler` function to generate a response and a set of `triggers` which determine when a command is dispatched. With that in mind, take a peek at our "Hello, world" command below.

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
import { Client } from 'ghastly';

const client = new Client({ prefix: '!' });
```

<p class="tip">
  The Ghastly client actually extends the Discord.js client, so if you need to pass in any `ClientOptions`, now would be the time.
</p>

Now that our client is instantiated, we can start registering commands on the client's dispatcher.

```js
client.dispatcher.load(helloWorld);
```

Once our command is loaded, we can `login()` with the client and test it out.

<div align="center">
  <img src="/assets/readme/hello-world.png">
</div>

### Evil Eval
Have you ever had the itch to use your bot as a JavaScript console? Now you can! We'll build a command which interprets input as JavaScript, evaluates it, and returns to us the results of the evaluation.

We start off similarly to our previous example by defining a configurator for the `eval` command. What's different is that we now have to handle retrieving command arguments. To do this, we'll add a new property to the returned configuration object: an array called `parameters`.

```js
function evilEval() {
  async function handler({ args }) {
    console.log(args.code);
  }

  return {
    handler,
    triggers: ['eval'],
    parameters: ['code...'],
  };
}
```

By adding the string `code` to the `parameters` array, we're telling Ghastly to parse a parameter from the input string and place its value into the `args` object. Every time a handler is invoked, it gets passed a **context** object containing several useful properties; the `args` object is one of those properties.

Notice that we also added the ellipsis (`...`) to the parameter name. Ghastly delimits command arguments by spaces (with exception to strings wrapped in quotes). The ellipsis forms what's called a *literal parameter*, telling Ghastly to skip this preprocessing step and retrieve the parameter value as is so that we don't accidentally change the meaning of the code.

With that done, we only need to evaluate the code and report the results:

```js
import { inspect } from 'util';

async function handler({ args }) {
  try {
    const result = eval(args.code);

    return `**RESULT**:\n\`\`\`js\n${inspect(result)}\n\`\`\``;
  } catch (error) {
    return `**ERROR**:\n\`\`\`js\n${error}\n\`\`\``;
  }
}
```

#### Doing Markdown the Right Way
Our command reports results in a nicely formatted code block, but having to manually format the Markdown is quite messy. Instead, we'll take advantage of the handy Markdown formatter that Ghastly injects into the context:

```js
import { inspect } from 'util';

async function handler({ args, formatter }) {
  const { bold, codeBlock } = formatter;

  try {
    const result = eval(args.code);

    // just supply the code and (optional) syntax highlighting language
    return `${bold('RESULT')}:\n${codeBlock(inspect(result), 'js')}`;
  } catch (error) {
    return `${bold('ERROR')}:\n${codeBlock(error, 'js')}`;
  }
}
```

#### Reporting with Embeds
Codeblocks are nice, but you have to admit that they look rather plain. In the past, message formatting was basically limited to what Markdown could offer, but with the introduction of [embeds](https://discordapp.com/developers/docs/resources/channel#embed-object) we can finally begin generating messages that actually look *proper*.

Discord.js already provides the [RichEmbed](https://discord.js.org/#/docs/main/stable/class/RichEmbed) class as a helpful wrapper around the message embed feature, so let's put it to use.

```js
import { RichEmbed } from 'discord.js';
import { inspect } from 'util';

async function handler({ args, message }) {
  const embed = new RichEmbed();

  embed.setTitle('EVAL').setAuthor(message.author.username, message.author.avatarURL);

  const start = Date.now();

  try {
    const result = eval(args.code);
    const end = Date.now();

    embed.setDescription(`Finished evaluating in ${end - start} ms.`)
      .setColor(0x2ECC71) // green
      .addField('INPUT', `\`\`\`js\n${args.code}\n\`\`\``)
      .addField('RESULT', `\`\`\`js\n${inspect(result)}\n\`\`\``);
  } catch (error) {
    const end = Date.now();

    embed.setDescription(`Finished evaluating in ${end - start} ms.`)
      .setColor(0xE74C3C) // red
      .addField('INPUT', `\`\`\`js\n${args.code}\n\`\`\``)
      .addField('ERROR', `\`\`\`js\n${error}\n\`\`\``);
  }

  return embed;
}
```

<div align="center">
  <img src="/assets/readme/eval-embed.png">
</div>

#### Restricting Command Access
There's still an obvious problem with our `eval` command. The code we're retrieving as an argument is run within the scope of the command handler, so it basically has access to anything our handler has access to. This can evidently lead to serious *accidents*.

The easiest way to deal with this is to simply keep a whitelist of people allowed to use the command (hopefully you trust said people with your life). We'll introduce a new concept to handle this: **middleware**.

Middleware are functions which intercept messages before they're passed to the command handler. They have the power to modify what's passed to the handler in addition to blocking anything they don't want to pass through. There can be multiple middleware functions chained to each other so that the results of one function gets passed to the next; we call each of these chained functions a **layer**.

In our case, we'll use middleware to block incoming `eval` commands from people we don't trust. Luckily, Ghastly provides us with a useful filter middleware called `expectUser()` which lets us whitelist people who can use the `eval` command. `expectUser()` can whitelist users by ID or by a combination of username and discriminator (e.g. `Bob#1234`).

To attach middleware to a command, we supply an array of layers as the `middleware` option in our configurator:

```js
import { expectUser } from 'ghastly/middleware';

function evilEval() {
  // ...

  return {
    handler,
    triggers: ['eval'],
    parameters: ['code...'],
    // layers are executed in the order they're defined
    middleware: [
      // supply any number of user identifiers to whitelist
      expectUser(
        '606780443435650178',
        '427870646725546192',
        'ITrustThisGuy#4953',
      ),
    ],
  };
}
```

Now our command will be restricted to a certain group of (hopefully well-behaved) users.

<p class="tip">
  In case you're still not happy with the safety of `eval`, or if you just don't trust anyone, it's possible to make `eval` run inside of a sandboxed environment (so there's no danger of someone tampering with Node globals like `process`). Since this isn't directly related to Ghastly, we've relegated that to the [Examples](/examples#a-less-evil-eval) page for you to check out whenever you feel like it.
</p>

### Next Steps
We've covered the basics of Ghastly with a high-level walkthrough and built a bot with some interesting commands, but there's still more we haven't dived into yet. The [Guide](/guide) will take you through some of the more advanced topics in Ghastly and at the same time go deeper into topics that we've already covered.

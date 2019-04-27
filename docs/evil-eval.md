# Evil Eval
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
const { inspect } = require('util');

async function handler({ args }) {
  try {
    const result = eval(args.code);

    return `**RESULT**:\n\`\`\`js\n${inspect(result)}\n\`\`\``;
  } catch (error) {
    return `**ERROR**:\n\`\`\`js\n${error}\n\`\`\``;
  }
}
```

## Doing Markdown the Right Way
Our command reports results in a nicely formatted code block, but having to manually format the Markdown is quite messy. Instead, we'll take advantage of the handy Markdown formatter that Ghastly injects into the context:

```js
const { inspect } = require('util');

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

## Reporting with Embeds
Codeblocks are nice, but you have to admit that they look rather plain. In the past, message formatting was basically limited to what Markdown could offer, but with the introduction of [embeds](https://discordapp.com/developers/docs/resources/channel#embed-object) we can finally begin generating messages that actually look *proper*.

Discord.js already provides the [RichEmbed](https://discord.js.org/#/docs/main/stable/class/RichEmbed) class as a helpful wrapper around the message embed feature, so let's put it to use.

```js
const { Constants, RichEmbed } = require('discord.js');
const { inspect } = require('util');

async function handler({ args, formatter, message }) {
  const { codeBlock } = formatter;
  const embed = new RichEmbed();

  embed.setTitle('EVAL').setAuthor(message.author.username, message.author.avatarURL);

  const start = Date.now();

  try {
    const result = eval(args.code);
    const end = Date.now();

    embed.setDescription(`Finished evaluating in ${end - start} ms.`)
      .setColor(Constants.Colors.GREEN)
      .addField('INPUT', codeBlock(args.code, 'js'))
      .addField('RESULT', codeBlock(inspect(result), 'js'));
  } catch (error) {
    const end = Date.now();

    embed.setDescription(`Finished evaluating in ${end - start} ms.`)
      .setColor(Constants.Colors.RED)
      .addField('INPUT', codeBlock(args.code, 'js'))
      .addField('ERROR', codeBlock(error, 'js'));
  }

  return embed;
}
```

<div align="center">
  <img src="/assets/readme/eval-embed.png">
</div>

## Restricting Command Access
There's still an obvious problem with our `eval` command. The code we're retrieving as an argument is run within the scope of the command handler, so it basically has access to anything our handler has access to. This can evidently lead to serious *accidents*.

The easiest way to deal with this is to simply keep a whitelist of people allowed to use the command (hopefully you trust said people with your life). We'll introduce a new concept to handle this: **middleware**.

Middleware are functions which intercept messages before they're passed to the command handler. They have the power to modify what's passed to the handler in addition to blocking anything they don't want to pass through. There can be multiple middleware functions chained to each other so that the results of one function gets passed to the next; we call each of these chained functions a **layer**.

In our case, we'll use middleware to block incoming `eval` commands from people we don't trust. Luckily, Ghastly provides us with a useful filter middleware called `expectUser()` which lets us whitelist people who can use the `eval` command. `expectUser()` can whitelist users by ID or by a combination of username and discriminator (e.g. `Bob#1234`).

To attach middleware to a command, we supply an array of layers as the `middleware` option in our configurator:

```js
const { expectUser } = require('ghastly/middleware');

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

?> In case you're still not happy with the safety of `eval`, or if you just don't trust anyone, it's possible to make `eval` run inside of a sandboxed environment (so there's no danger of someone tampering with Node globals like `process`). Since this isn't directly related to Ghastly, we've relegated that to the [Examples](a-less-evil-eval) section for you to check out whenever you feel like it.

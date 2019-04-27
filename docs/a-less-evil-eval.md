# A Less Evil Eval
In the [Getting Started](evil-eval) tutorial, we built an `eval` command which allowed users to execute arbitrary JavaScript on our bot. We also implemented a command whitelist using middleware so that only trusted users can access the `eval` command. While this works, there's nothing to actually stop a user from executing malicious code and causing serious problems.

With this in mind, we're going to want to sandbox our script's execution as much as possible. To do this, we can take advantage of the [vm2](https://github.com/patriksimek/vm2) library.

## Sandboxing eval()
To start, let's install vm2.

```bash
npm install --save vm2
```

Now we can import the `VM` class and create a VM environment to run our code in.

```js
const { Constants, RichEmbed } = require('discord.js');
const { VM } = require('vm2');
const { inspect } = require('util');

function evilEval() {
  async function handler({ args, formatter, message }) {
    const { codeBlock } = formatter;
    const vm = new VM();
    const embed = new RichEmbed();

    embed.setTitle('EVAL').setAuthor(message.author.username, message.author.avatarURL);

    const start = Date.now();

    try {
      // run inside a VM context and limit what the code can access
      const result = vm.run(args.code);
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

  return {
    handler,
    triggers: ['eval'],
    parameters: ['code...'],
  };
}
```

Now we won't leak any of our sensitive variables to the evaluated code and at the same time it'll still have access to basic globals like `Math`. However, there's still a problem. What if someone sneaks in an infinite loop, in the manner of `while (true) {}`? We'll protect against this by specifying an execution timeout.

```js
// if the code doesn't finish running in 5 seconds, we'll get an error
const vm = new VM({ timeout: 5000 });
```

<div align="center">
  <img src="/assets/examples/safe-eval-error.png">
</div>

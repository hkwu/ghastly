# Basics

In order to streamline the design of Discord bots, Ghastly provides a simple API (revolving around the `Command` class) for generating commands.

This section is intended to provide a workable example of command design. Later parts of the documentation will provide more detailed instructions on building commands.

## Using `Command`

First, import the class.

```js
import { Command } from 'ghastly';
```

Then, extend it to create your own command class.

```js
class MyCommand extends Command {
  get structure() {
    return {
      signature: '!myCommand'
    };
  }
  
  handle(message, args) {
    message.channel.sendMessage('Obeying human overlord!');
  }
}
```

There are actually three different ways to specify a command:

1. Define the `structure` getter.
2. Define each property/method individually.
3. Use a combination of both. Note that properties defined outside the `structure` getter will override options defined inside it.

The following table lists the properties you may define on a command.

| Property | Required | Default |
| :------: | :------: | :-----: |
| signature | Yes | - |
| handle | Yes | - |
| description | No | 'No description set for this command.' |
| filters | No | See section on command filters. |
| mentionable | No | 'allow' |
| namespace | No | null |

## Example

We will design a simple "echo" command that takes a user's input and sends it back again, counting the time it takes to complete the command.

```js
import { Command } from 'ghastly';

class Echo extends Command {
  get structure() {
    return {
      signature: '!echo [input*]',
    };
  }
  
  handle(message, args) {
    const start = Date.now();
    const messageContent = `Echoing: ${args.input.join(' ')}`;
    
    message.channel.sendMessage(messageContent).then((message) => {
      const elapsed = Date.now() - start;
      message.edit(`${messageContent}\nElapsed time (ms): ${elapsed}`);
    }).catch(console.log);
  }
}
```

Firstly, we define our signature inside the `structure` getter. This is up to personal preference; you can define it using whichever method you like.

Notice our `[input*]` parameter. The `*` at the end of the parameter name indicates a variable-length parameter. This prompts Ghastly to parse as many arguments as it can from the user's message and set `args.input` to an array containing all of the parsed arguments (in the order they were given).

We also define our `handle()` method for reacting to the command. Inside it, we make a rudimentary timer using `Date.now()`. After sending our message, we calculate the elapsed time and update the message with the calculated time.

Simple!

# Command Signatures

Ghastly provides a slightly different framework for generating commands. Instead of defining how a command looks with a bunch of object properties,

```js
const command = {
  prefix: '!',
  name: 'ping',
  handle: (message) => {
    // ...
  },
};
```

Ghastly is capable of parsing a single string containing your command definition.

## Creating a Signature

Signatures are simply strings defined on your command class. They all have the following form:

```js
'!ping [argument] [argument2]'
```

### Identifier

The identifier for your command acts as its trigger. The first space-delimited word in your string will be parsed as its identifier. For instance, `'!ping'` would be the identifier for the above signature. Notice how the prefix is included as part of the command name.

Multiple identifiers can be specified for a signature by delimiting each identifier with a pipe. For instance,

```js
'!ping|!pong'
```

would be triggered upon receiving `'!ping'` or `'!pong'`.

You may also specify a RegEx pattern to act as an identifier. Any string matching this pattern will trigger the command. To specify a RegEx pattern, use the syntax `/pattern/flags` as your identifier.

```js
'/!ping/i' // accepts !ping, ignoring case
```

Note that the pattern must contain no whitespace.

```js
// bad
'/bad command[0-9] [a-Z]trigger/'

// good
'/goodCommand[0-9][a-Z]Trigger/'
```

### Parameters

You can also define parameters for your commands. Upon successful trigger of a command, Ghastly will parse the received message for arguments and pass them directly to your command handler (in an object, keyed according to your parameter names).

For instance, upon triggering the following command,

```js
'!ping [myArg]'
```

Ghastly will pass the value of `myArg` as given by the user to your message handler, allowing you to access it as so:

```js
class Ping extends Command {
  // ...
  handle(message, args) {
    console.log(args.myArg); // logs the value of myArg
  }
}
```

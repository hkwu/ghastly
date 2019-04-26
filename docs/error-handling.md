# Error Handling
Ghastly catches and emits errors it encounters while handling commands in order to prevent them from being lost as unhandled promise rejections. To subscribe to these errors, attach a listener to the client's `dispatchFail` event.

```js
client.on('dispatchFail', (reason, context) => {
  console.log(reason, context);
});
```

The client will emit two arguments: a string `reason` labelling the type of error it encountered, and a `context` object containing data related to the error. This lets you cherry pick just the errors you want to handle while letting the rest fall through.

```js
client.on('dispatchFail', (reason, context) => {
  switch (reason) {
    case 'handlerError':
      return handleError();
    case 'dispatch':
      return handleOtherError();
    default:
      // do nothing
  }
});
```

## Types of Errors
The following describes the different kinds of dispatch errors the client emits, as well as the `context` received with each error.

### eventFilter
Emitted when a [message update](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=messageUpdate) is received but the message's content has not changed.

- `message`: the `Message` before the update.
- `newMessage`: the `Message` after the update.

### prefixFilter
Emitted when a message is received which doesn't match the prefix supplied to the client.

- `message`: the `Message` which was received.

### parseCommand
Emitted when there is a problem parsing a message's text for a command and its arguments.

- `message`: the `Message` which was received.

### unknownCommand
Emitted when a command is parsed from a message, but the parsed command cannot be found in the client's command registry.

- `message`: the `Message` which was received.
- `command`: the command which was parsed from the message.

### parseArguments
Emitted when there is a problem parsing a message's text for command arguments. This may occur when the format of the argument string does not match a command's defined parameters.

- `message`: the `Message` which was received.
- `command`: the command which was parsed from the message.
- `error`: the `Error` which occurred during parsing.

### handlerError
Emitted when there is a problem executing a command handler and its middleware chain.

- `message`: the `Message` which was received.
- `command`: the command which was parsed from the message.
- `args`: the arguments which were parsed from the message.
- `error`: the `Error` which occurred during execution.

### middlewareFilter
Emitted when a command's middleware chain prevented a response from being dispatched.

- `message`: the `Message` which was received.
- `command`: the command which was parsed from the message.
- `args`: the arguments which were parsed from the message.

### dispatch
Emitted when there is a problem dispatching a response value.

- `message`: the `Message` which was received.
- `command`: the command which was parsed from the message.
- `args`: the arguments which were parsed from the message.
- `response`: the response value being dispatched.
- `error`: the `Error` which occurred during dispatch.

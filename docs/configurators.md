# Configurators
The main purpose of Ghastly is to ease the design and management of client commands. This allows you to avoid the boilerplate and/or spaghetti code that inevitably results when defining inline commands with the native Discord.js events system.

Ghastly doesn't export any base `Command` class; commands are defined as functions. This is meant to encourage stateless commands, which will help keep your code focused and easy to reason about.

```js
function ping() {
  async function handler() {
    return 'Pong!';
  }

  return {
    handler,
    triggers: [
      'ping',
    ],
  };
}
```

These functions must return a configuration object which describes the behaviour of the command. We'll call these functions command configurators, or **configurators** for short.

## Command Configuration
This section will briefly describe what the configuration object should contain.

### handler
The `handler` is a function that gets called when the command is triggered. It should contain the main logic for making a response based on the user input received from the client. We'll cover in more detail how handlers work later on.

```js
async function handler() {
  // returning a string sends it as a message
  return 'Hello, world!';
}

return {
  handler,
};
```

### triggers
`triggers` is a non-empty array of strings. The first string is treated as the command's main name while any additional values are used as aliases for the command. Each trigger should be a unique value among every command.

```js
return {
  triggers: [
    'mainTrigger',
    'firstAlias',
    'secondAlias',
  ],
};
```

### parameters
Your command may accept any number of parameters of various types. `parameters` is an array of parameter definitions.

```js
return {
  parameters: [
    // you can define parameters as a string
    'age : Your age.',
    // or as an object
    {
      name: 'height',
      description: 'Your height.',
    },
  ],
};
```

### group
Commands can optionally be tagged with a certain group to make it easier to manage multiple commands at once.

```js
return {
  group: 'admin',
};
```

Note that command groups do not function as a namespace for commands, so two commands in different groups will still need to have unique triggers.

### description
The `description` is an optional string which describes the command's function and is only stored for your own use (useful if you're making a `help` command, for instance).

```js
return {
  description: 'Fetches weather data.',
};
```

### middleware
You can also define middleware for your commands. Middleware are simply functions which wrap the command handler and provide an easy, modular way to extend command handler functionality.

The `middleware` option is an array of middleware that will be applied to the command's handler function. Middleware are executed in the order they're defined in the `middleware` array.

```js
return {
  middleware: [
    first(),
    second(),
  ],
};
```

If you're not familiar with the concept of middleware, it's useful to think of them as layers stacked on top of the command handler. Each layer can intercept and potentially alter what gets sent into the next layer. We will cover middleware usage and the process of creating your own middleware in [another section](middleware).

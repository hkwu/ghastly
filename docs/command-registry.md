# Command Registry
The client stores commands in a [CommandRegistry](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/CommandRegistry.js~CommandRegistry.html). You can access the registry as an injected context property or as `client.commands`:

```js
async function handler({ commands }) {
  const ping = commands.get('ping');
}
```

## Using the Command Registry
The registry provides several methods for managing commands.

### Adding a Command
To add a command, use `commands.add()`, providing any number of configurators as arguments:

```js
client.commands.add(ping, weather, food, sports);
```

### Retrieving a Command
To retrieve a command, use `commands.get()`, providing any of the command's triggers as an argument:

```js
client.commands.get('ping');
```

The retrieved command will be a [CommandObject](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/command/CommandObject.js~CommandObject.html) instance.

!> When retrieving commands, a *reference* to the `CommandObject` is returned. Since Ghastly relies on the registry internally, you should **never** mutate the returned `CommandObject`.

### Adding Group Middleware
To add middleware to a command group, use `commands.applyGroupMiddleware()`, providing the command group name and an array of layers to apply:

```js
const { expectGuild } = require('ghastly/middleware');

client.commands.applyGroupMiddleware('music', [
  expectGuild(),
]);
```

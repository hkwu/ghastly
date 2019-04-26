# Command Groups
You can define groups to organize commands by providing the `group` option in your configurator.

```js
return {
  group: 'admin',
};
```

Command groups allow you to organize and configure multiple commands in a more convenient fashion.

## Group Middleware
Groups allow us to define middleware that will be applied to multiple commands. Group middleware function identically to the middleware you define in individual configurators. To add middleware to a group, use the `applyGroupMiddleware()` method on the command registry:

```js
const { expectGuild } = require('ghastly/middleware');

client.commands.applyGroupMiddleware('admin', [
  expectGuild(),
]);
```

Group middleware will be inserted before the first layer of each command's middleware chain. This gives group middleware the privilege of handling the context object before passing it to any other layers down the line.

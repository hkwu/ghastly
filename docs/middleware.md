# Middleware
Ghastly provides a middleware system that allows additional logic to be wrapped around command handlers.

## Usage
You can add middleware to a command by providing an array of middleware functions in your configurator object.

```js
return {
  middleware: [
    myMiddleware(),
  ],
};
```

Notice how we use `myMiddleware()` instead of `myMiddleware`. As a matter of convention, middleware are not used directly; they are always wrapped and created by higher order functions. This allows us to configure the middleware prior to attaching it to a command.

## Defining Middleware
In order to define your own custom middleware, simply create a higher order function which returns the `async` middleware function. We will call this function a middleware layer, or **layer** for short.

Layers receive two arguments: the `next` layer in the middleware chain, and the `context` object passed in by the previous layer. A layer has the power to continue the chain or exit it. By calling the `next` layer, the chain continues. Conversely, if the layer does not call `next`, the chain stops and no other layers are executed. The command handler function lies at the end of the middleware chain.

```js
function loggingMiddleware() {
  return async (next, context) => {
    console.log('Current context:');
    console.log(context);

    return next(context);
  };
}
```

When you're ready to use `loggingMiddleware`, just call it to create the layer.

```js
return {
  middleware: [
    loggingMiddleware(),
  ],
};
```

### Working with Context
Since layers have direct access to the context object, they are able to read, write and even completely obliterate the context.

```js
function middlewareThatChangesProperties() {
  return async (next, context) => {
    Object.keys(context).forEach((key) => {
      context[key] = 'I changed this!';
    });

    context.injectedProperty = 'I added this.';

    return next(context);
  };
}
```

### Before and After Middleware
You can make your layer execute before or after other layers depending on when you delegate to the `next` layer. For instance, the following middleware will execute some logic then delegate to the next layer in the chain.

```js
function before() {
  return async (next, context) => {
    doSomething(context);

    return next(context);
  };
}
```

Whereas this middleware will delegate and wait for the return value of the next layer before executing its own logic.

```js
function after() {
  return async (next, context) => {
    const returned = await next(context);

    doSomething(returned);

    return returned;
  };
}
```

The returned value depends on the layer that's next in the chain. If there are no other layers left, the returned value is that of the command's handler function.

## Builtins
Ghastly comes equipped with several convenience middleware. You can access these as named exports from `ghastly/middleware`:

```js
const { expectPermissions } = require('ghastly/middleware');
```

### Filters
Filter middleware are intended to block messages based on certain restrictions. They can be useful to prevent command abuse.

#### expectDM()
`expectDM()` blocks a message if it isn't received in a direct message channel.

#### expectGroupDM()
`expectDM()` blocks a message if it isn't received in a group direct message channel.

#### expectGuild()
`expectGuild()` blocks a message if it isn't received in a guild text channel.

#### expectPermissions()
`expectPermissions()` blocks a message if a user does not have all of the specified permissions.

```js
expectPermissions(
  'KICK_MEMBERS',
  'BAN_MEMBERS',
);
```

#### expectRole()
`expectRole()` blocks a message if the user does not have any of the specified roles. Role IDs and names are accepted.

```js
expectRole(
  '451517041536222613',
  'The Rock',
);
```

?> Keep in mind that role names are non-unique so the filter may not behave as expected when identical names exist.

#### expectUser()
`expectUser()` blocks a message if it didn't come from any of the specified users. User IDs and tags (the kind you see after typing a mention) are accepted.

```js
expectUser(
  '513412460316527251',
  'The Rock#5555',
  'RainbowFiend#9386',
);
```

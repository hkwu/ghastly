# Services
In some cases, you may find that your commands have external dependencies. For instance, a music client may depend on a queueing system to store information about which songs to play next. You may be tempted to simply store the queue somewhere your handler can reach:

```js
const { VoiceResponse } = require('ghastly/command');

// our magic music queue
const queue = new MusicQueue();

function playSong() {
  async function handler() {
    const nextStream = queue.next();

    return new VoiceResponse('stream', nextStream);
  }

  // ...
}
```

However, this becomes ugly when you need to share the queue with other commands that also have a dependency on it (`addSong`, `removeSong`, etc.). Ghastly provides a centralized system to organize and fetch these dependencies via the [ServiceContainer](https://doc.esdoc.org/github.com/hkwu/ghastly/class/src/client/services/ServiceContainer.js~ServiceContainer.html) interface.

When you have access to the context object, a reference to the container is automatically injected for you.

```js
async function handler({ services }) {
  const queue = services.get('music.queue');
  const nextStream = queue.next();

  return new VoiceResponse('stream', nextStream);
}
```

Elsewhere, you can access the container through `client.services`.

## Using the Service Container
The service container provides several methods for binding and retrieving services.

### Binding Constructed Services
Constructed services are services which are rebuilt each time they're fetched from the service container. To bind a new constructed service, use `services.construct()`. You must provide a name for the service in addition to a function which constructs and returns that service.

```js
// bind the MusicQueue instance under a single name
client.services.construct('music.queue', () => new MusicQueue());

// bind the MusicQueue instance with an alias
client.services.construct(['music.queue', 'queue'], () => new MusicQueue());
```

?> Every service binding is stored in the same namespace, so make sure you pick names that won't collide easily.

### Binding Singletons
In order to construct a service once and reuse the constructed service on subsequent fetches, use the `singleton()` method.

```js
client.services.singleton('music.queue', () => {
  const queue = new MusicQueue();

  // perform some queue initialization

  return queue;
});
```

### Binding Instances
If you wish to bind a previously constructed service, use the `instance()` method.

```js
const queue = new MusicQueue();

client.services.instance('music.queue', queue);
```

### Unbinding Services
To remove bindings, use `services.unbind()`.

```js
client.services.unbind('music.queue');
```

Unbinding a service will remove all aliases associated with that service.

### Binding Services with Providers
Once you start binding a large number of services, it may be useful to take advantage of the **service provider** functionality. Providers are functions which bind a predefined selection of services to the service container.

```js
function musicProvider({ container }) {
  container.instance('music.queue', new MusicQueue());
}
```

Providers receive the service container as an argument. They may bind any number of services to the container, though it's best to keep each provider focused on binding a specific group of services. To use a provider, you can pass the provider function to the container's `bindProviders()` method, which accepts a variable number of providers.

```js
client.services.bindProviders(musicProvider);
```

### Checking If a Service Exists
If you wish to check that a service exists, you can use the `has()` method.

```js
client.services.has('music.queue'); // true
```

### Fetching Services
To retrieve a service from the container, use the `get()` method.

```js
const queue = client.services.get('music.queue');
```

If the requested service is not found, `null` is returned instead. 

# Constructing the Client

The Ghastly client is designed to wrap around the existing Discord.js client. This avoids the problem of having to re-exporting structures provided from Discord.js in this library, allowing you to use those structures alongside Ghastly.

## Creation

The `make()` function is provided to construct a Ghastly client. It takes two parameters:

1. The Discord.js client constructor.
2. The config object to pass to the Discord.js client constructor while creating the client.

```js
const make = require('ghastly').make;
const Discord = require('discord.js');

const client = make(Discord.Client, {
  api_request_method: 'burst',
  disable_everyone: false,
});

/* ES6 */

import { make } from 'ghastly';
import Discord from 'discord.js';

const client = make(Discord.Client, {
  api_request_method: 'burst',
  disable_everyone: false,
});
```

Examples in the documentation will use ES6 syntax from this point on.

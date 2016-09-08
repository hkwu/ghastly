import BaseResolver from './BaseResolver';

/**
 * Options resolver for Client class.
 * @extends {BaseResolver}
 */
export default class ClientResolver extends BaseResolver {
  constructor() {
    super();

    this._resolver.setDefaults({
      events: [],
      commands: [],
    }).setAllowedTypes('events', 'array')
      .setAllowedTypes('commands', 'array');
  }
}

import BaseResolver from './BaseResolver';

/**
 * @classdesc Options resolver for Client class.
 * @extends BaseResolver
 */
export default class ClientResolver extends BaseResolver {
  /**
   * Constructor.
   */
  constructor() {
    super();

    this.resolver.setDefaults({
      events: {},
      commands: {},
    }).setAllowedTypes('events', 'plainObject')
      .setAllowedTypes('commands', 'plainObject');
  }
}

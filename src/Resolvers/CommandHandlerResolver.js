import BaseResolver from './BaseResolver';

/**
 * Options resolver for CommandHandler.
 * @extends BaseResolver
 */
export default class CommandHandlerResolver extends BaseResolver {
  constructor() {
    super();

    this._resolver.setDefaults({
      commands: {},
      messageHandlers: {},
    }).setAllowedTypes('commands', 'plainObject')
      .setAllowedTypes('messageHandlers', 'plainObject');
  }
}

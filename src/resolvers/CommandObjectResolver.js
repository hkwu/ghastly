import BaseResolver from './BaseResolver';

/**
 * @classdesc Options resolver for CommandObject class.
 * @extends BaseResolver
 * @ignore
 */
export default class CommandObjectResolver extends BaseResolver {
  /**
   * Constructor.
   */
  constructor() {
    super();

    this.resolver.setRequired([
      'handler',
      'triggers',
    ]).setDefaults({
      parameters: [],
      description: null,
      middleware: [],
    }).setAllowedTypes('handler', 'function')
      .setAllowedTypes('triggers', 'array')
      .setAllowedTypes('parameters', 'array')
      .setAllowedTypes('description', ['string', 'null'])
      .setAllowedTypes('middleware', 'array');
  }
}

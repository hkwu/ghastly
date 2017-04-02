import BaseResolver from './BaseResolver';

/**
 * @desc Options resolver for CommandObject class.
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
      group: null,
      description: null,
      middleware: [],
    }).setAllowedTypes('handler', 'function')
      .setAllowedTypes('triggers', 'array')
      .setAllowedTypes('parameters', 'array')
      .setAllowedTypes('group', ['string', 'null'])
      .setAllowedTypes('description', ['string', 'null'])
      .setAllowedTypes('middleware', 'array');
  }
}

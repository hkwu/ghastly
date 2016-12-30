import BaseResolver from './BaseResolver';

/**
 * @classdesc Options resolver for ServiceRegistryEntry class.
 * @extends BaseResolver
 */
export default class ServiceRegistryEntryResolver extends BaseResolver {
  /**
   * Constructor.
   */
  constructor() {
    super();

    this.resolver.setRequired([
      'isSingleton',
    ]).setDefaults({
      aliases: [],
    }).setAllowedTypes('isSingleton', 'boolean')
      .setAllowedTypes('aliases', 'array');
  }
}

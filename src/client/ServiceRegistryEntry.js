import ServiceRegistryEntryResolver from '../resolvers/ServiceRegistryEntryResolver';

/**
 * @classdesc Records information about a service.
 */
export default class ServiceRegistryEntry {
  /**
   * Constructor.
   * @param {Object} options - Options for the entry.
   */
  constructor(options) {
    const resolver = new ServiceRegistryEntryResolver();
    const { isSingleton, aliases } = resolver.resolve(options);

    /**
     * Whether or not this service is treated as a singleton.
     * @type {boolean}
     */
    this.isSingleton = isSingleton;

    /**
     * The aliases bound to this entry's identifier.
     * @type {Set.<string>}
     */
    this.aliases = new Set(aliases);
  }
}

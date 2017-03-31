/**
 * @desc Records information about a service.
 */
export default class ServiceRegistryEntry {
  /**
   * Constructor.
   * @param {Object} options - Options for the entry.
   * @param {boolean} options.isSingleton - Whether or not this service is
   *   treated as a singleton.
   * @param {string[]} options.aliases - The aliases bound to this entry's
   *   identifier.
   */
  constructor(options) {
    const { isSingleton, aliases } = options;

    /**
     * Whether or not this service is treated as a singleton.
     * @type {boolean}
     */
    this.isSingleton = isSingleton;

    /**
     * The aliases bound to this entry's identifier.
     * @type {string[]}
     */
    this.aliases = aliases;
  }
}

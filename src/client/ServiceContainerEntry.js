/**
 * @desc Records information about a service.
 * @ignore
 */
export default class ServiceContainerEntry {
  /**
   * Type identifier for constructed services.
   * @type {string}
   */
  static CONSTRUCTED = 'CONSTRUCTED';

  /**
   * Type identifier for singleton services.
   * @type {string}
   */
  static SINGLETON = 'SINGLETON';

  /**
   * Type identifier for instance services.
   * @type {string}
   */
  static INSTANCE = 'INSTANCE';

  /**
   * @param {Object} options - Options for the entry.
   * @param {string} options.type - The type of service being stored.
   * @param {*} options.service - The service.
   * @param {string[]} [options.aliases=[]] - Aliases for this entry.
   */
  constructor({ type, service, aliases = [] }) {
    /**
     * Aliases for this entry.
     * @type {string[]}
     */
    this.aliases = aliases;

    /**
     * The type of service being stored.
     * @type {string}
     * @private
     */
    this.type = type;

    /**
     * The service builder.
     * @type {*}
     * @private
     */
    this.builder = service;

    /**
     * The built service. Only applicable to singletons or instances.
     * @type {?*}
     * @private
     */
    this.built = type === this.constructor.INSTANCE ? service : null;
  }

  /**
   * The service.
   * @type {*}
   */
  get service() {
    switch (this.type) {
      case this.constructor.CONSTRUCTED:
        return this.builder();
      case this.constructor.SINGLETON:
        if (!this.built) {
          this.built = this.builder();
        }

        return this.built;
      case this.constructor.INSTANCE:
        return this.built;
      default:
        throw new Error(`Unknown service type: ${this.type}.`);
    }
  }
}

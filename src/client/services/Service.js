/**
 * Type identifier for services.
 * @type {Object}
 * @const
 * @ignore
 */
export const ServiceTypes = {
  CONSTRUCTED: 'CONSTRUCTED',
  SINGLETON: 'SINGLETON',
  INSTANCE: 'INSTANCE',
};

/**
 * @desc Records information about a service.
 * @interface
 * @ignore
 */
export default class Service {
  /**
   * Constructor.
   * @param {Object} options - Options for the entry.
   * @param {string[]} [options.aliases=[]] - Aliases for this entry.
   * @param {?Function} [options.builder=null] - The service builder. Only applicable
   *   to constructed and singleton services.
   * @param {?*} [options.instance=null] - The service instance. Only applicable
   *   to singleton and instance services.
   */
  constructor(options) {
    const {
      aliases = [],
      builder = null,
      instance = null,
    } = options;

    /**
     * Aliases for this entry.
     * @type {string[]}
     */
    this.aliases = aliases;

    /**
     * The service builder. Only applicable to constructed and singleton services.
     * @type {?Function}
     * @protected
     */
    this.builder = builder;

    /**
     * The service instance. Only applicable to singleton and instance services.
     * @type {?*}
     * @protected
     */
    this.instance = instance;
  }
}

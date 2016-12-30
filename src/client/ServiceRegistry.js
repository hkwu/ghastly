import { isArray, isFunction } from 'lodash/lang';
import ServiceRegistryEntry from './ServiceRegistryEntry';
import StringMap from '../util/StringMap';

/**
 * @classdesc Manages services in the application.
 */
export default class ServiceRegistry {
  /**
   * Constructor.
   */
  constructor() {
    /**
     * The services stored in this registry.
     * @type {StringMap.<ServiceRegistryEntry>}
     * @private
     */
    this.services = new StringMap();

    /**
     * The identifier aliases in this registry.
     * @type {StringMap.<string>}
     * @private
     */
    this.aliases = new StringMap();

    /**
     * The registered constructed services.
     * @type {StringMap.<Function>}
     * @private
     */
    this.constructed = new StringMap();

    /**
     * The registered singleton services.
     * @type {StringMap.<*>}
     * @private
     */
    this.singletons = new StringMap();
  }

  /**
   * Returns an iterator containing the main service bindings that have been
   *   registered.
   * @type {Iterator.<string>}
   */
  get mainBindings() {
    return this.services.keys();
  }

  /**
   * Binds a service to the registry.
   * @param {(string|Array.<string>)} identifier - The identifier(s) for this service.
   * @param {*} service - The service to provide. If given a function, the function
   *   is executed and the resulting service returned each time the service is
   *   fetched. Otherwise, the service is treated as a singleton and the same
   *   instance will be returned each time it is fetched.
   * @returns {ServiceRegistry} The instance this method was called on.
   */
  bind(identifier, service) {
    const [name, ...aliases] = isArray(identifier) ? [...identifier] : [identifier];
    const isSingleton = isFunction(service);

    this.services.set(name, new ServiceRegistryEntry({ isSingleton, aliases }));

    // add the service reference
    if (isSingleton) {
      this.singletons.set(name, service);
    } else {
      this.constructed.set(name, service);
    }

    // add the aliases
    aliases.forEach((alias) => {
      this.aliases.set(alias, name);
    });

    return this;
  }

  /**
   * Removes a binding from the registry, along with its aliases.
   * @param {string} identifier - The identifier or an alias for the service.
   * @returns {ServiceRegistry} The instance this method was called on.
   */
  unbind(identifier) {
    const mainBinding = this.getMainBinding(identifier);

    if (!this.services.has(mainBinding)) {
      return this;
    }

    const entry = this.services.get(mainBinding);

    // kill the service reference
    if (entry.isSingleton) {
      this.singletons.delete(mainBinding);
    } else {
      this.constructed.delete(mainBinding);
    }

    // kill the aliases
    entry.aliases.forEach((alias) => {
      this.aliases.delete(alias);
    });

    return this;
  }

  /**
   * Determines if an identifier has been bound in the registry.
   * @param {string} identifier - The identifier.
   * @returns {boolean} True if the identifier was bound.
   */
  has(identifier) {
    return this.aliases.has(identifier) || this.services.has(identifier);
  }

  /**
   * Fetches a service from the registry, constructing it if necessary.
   * @param {string} identifier - The identifier of the service to fetch.
   * @returns {?*} The service requested, or `null` if no service was bound
   *   under that identifier.
   */
  fetch(identifier) {
    const mainBinding = this.getMainBinding(identifier);

    if (!this.services.has(mainBinding)) {
      return null;
    }

    const entry = this.services.get(mainBinding);

    return entry.isSingleton
      ? this.fetchSingleton(mainBinding)
      : this.fetchConstructed(mainBinding);
  }

  /**
   * Returns the main bound identifier for an alias. If the alias is already a
   *   main bound identifier, that identifier is returned directly.
   * @param {string} alias - The alias.
   * @returns {(string|undefined)} The main bound identifier for the given alias,
   *   or `undefined` if this alias was not previously bound.
   * @private
   */
  getMainBinding(alias) {
    return this.services.has(alias) ? alias : this.aliases.get(alias);
  }

  /**
   * Fetches a singleton service.
   * @param {string} identifier - The identifier for the service.
   * @returns {*} The requested service, or `undefined` if it does not exist.
   * @private
   */
  fetchSingleton(identifier) {
    return this.singletons.get(identifier);
  }

  /**
   * Fetches a constructed service.
   * @param {string} identifier - The identifier for the service.
   * @returns {*} The requested service, or `undefined` if it does not exist.
   * @private
   */
  fetchConstructed(identifier) {
    const service = this.constructed.get(identifier);

    return service && service();
  }
}

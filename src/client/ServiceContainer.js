import { isArray, isFunction } from 'lodash/lang';
import ServiceContainerEntry from './ServiceContainerEntry';
import StringMap from '../utils/StringMap';

/**
 * @desc Manages services in the application.
 */
export default class ServiceContainer {
  constructor() {
    /**
     * The services stored in this container.
     * @type {StringMap.<ServiceContainerEntry>}
     * @private
     */
    this.services = new StringMap();

    /**
     * The identifier aliases in this container.
     * @type {StringMap.<string>}
     * @private
     */
    this.aliases = new StringMap();
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
   * Binds a service to the container which is rebuilt each time it is fetched.
   * @param {(string|string[])} identifier - The identifier of the service. If
   *   given an array, additional identifiers are added as service aliases.
   * @param {Function} builder - The function which will build the service.
   * @returns {ServiceContainer} The instance this method was called on.
   * @throws {TypeError} Thrown if the builder is not a function.
   */
  bind(identifier, builder) {
    if (!isFunction(builder)) {
      throw new TypeError('Expected service builder to be a function.');
    }

    return this.addService(identifier, ServiceContainerEntry.CONSTRUCTED, builder);
  }

  /**
   * Binds a service to the container which is built once and cached for subsequent
   *   fetches.
   * @param {(string|string[])} identifier - The identifier of the service. If
   *   given an array, additional identifiers are added as service aliases.
   * @param {Function} builder - The function which will build the service.
   * @returns {ServiceContainer} The instance this method was called on.
   * @throws {TypeError} Thrown if the builder is not a function.
   */
  singleton(identifier, builder) {
    if (!isFunction(builder)) {
      throw new TypeError('Expected service builder to be a function.');
    }

    return this.addService(identifier, ServiceContainerEntry.SINGLETON, builder);
  }

  /**
   * Binds a service to the container which is returned as a value each time it
   *   is fetched.
   * @param {(string|string[])} identifier - The identifier of the service. If
   *   given an array, additional identifiers are added as service aliases.
   * @param {*} value - The value to store as an instance.
   * @returns {ServiceContainer} The instance this method was called on.
   */
  instance(identifier, value) {
    return this.addService(identifier, ServiceContainerEntry.INSTANCE, value);
  }

  /**
   * A function which is passed a reference to a `ServiceContainer` and registers
   *   some service(s) under that container.
   * @callback serviceProvider
   * @param {Object} context - Object containing data for the service provider.
   * @param {ServiceContainer} context.container - The `ServiceContainer`.
   */

  /**
   * Binds services to the service container via service providers.
   * @param {...serviceProvider} providers - The service providers.
   * @returns {Dispatcher} The instance this method was called on.
   */
  bindProviders(...providers) {
    providers.forEach((provider) => {
      provider({ container: this });
    });

    return this;
  }

  /**
   * Removes a binding from the container, along with its aliases.
   * @param {string} identifier - The identifier or an alias for the service.
   * @returns {ServiceContainer} The instance this method was called on.
   */
  unbind(identifier) {
    const mainBinding = this.getMainBinding(identifier);

    if (!this.services.has(mainBinding)) {
      return this;
    }

    const entry = this.services.get(mainBinding);

    entry.aliases.forEach((alias) => {
      this.aliases.delete(alias);
    });

    return this;
  }

  /**
   * Determines if an identifier has been bound in the container.
   * @param {string} identifier - The identifier.
   * @returns {boolean} True if the identifier was bound.
   */
  has(identifier) {
    return this.aliases.has(identifier) || this.services.has(identifier);
  }

  /**
   * Fetches a service from the container, constructing it if necessary.
   * @param {string} identifier - The identifier of the service to fetch.
   * @returns {?*} The service requested, or `null` if no service was bound
   *   under that identifier.
   */
  get(identifier) {
    const mainBinding = this.getMainBinding(identifier);

    if (!this.services.has(mainBinding)) {
      return null;
    }

    const { service } = this.services.get(mainBinding);

    return service;
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
   * Adds a service to the container.
   * @param {(string|string[])} identifier - The identifier of the service. If
   *   given an array, additional identifiers are added as service aliases.
   * @param {string} type - The type of service being added.
   * @param {*} service - The service being added.
   * @return {ServiceContainer} The instance this method was called on.
   * @private
   */
  addService(identifier, type, service) {
    const [name, ...aliases] = isArray(identifier) ? identifier : [identifier];

    this.services.set(name, new ServiceContainerEntry({ type, service, aliases }));

    aliases.forEach((alias) => {
      this.aliases.set(alias, name);
    });

    return this;
  }
}

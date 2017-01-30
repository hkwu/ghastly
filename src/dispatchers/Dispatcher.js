import ServiceRegistry from '../client/ServiceRegistry';

/**
 * A function which is passed a reference to a `ServiceRegistry` and registers
 *   some service(s) under that registry.
 * @callback serviceProvider
 * @param {Object} context - Object containing data for the service provider.
 * @param {ServiceRegistry} context.registry - The `ServiceRegistry`.
 */

/**
 * @classdesc Receives and dispatches messages.
 */
export default class Dispatcher {
  /**
   * Constructor.
   */
  constructor() {
    /**
     * The client this dispatcher is attached to.
     * @type {?Ghastly}
     */
    this.client = null;

    /**
     * The service provider for the dispatcher.
     * @type {ServiceRegistry}
     */
    this.services = new ServiceRegistry();
  }

  /**
   * Binds a service to the service registry.
   * @param {string} name - The service name.
   * @param {*} service - The service to bind.
   * @returns {Dispatcher} The instance this method was called on.
   */
  bindService(name, service) {
    this.services.bind(name, service);

    return this;
  }

  /**
   * Binds services to the service registry via service providers.
   * @param {...serviceProvider} providers - The service providers.
   * @returns {Dispatcher} The instance this method was called on.
   */
  bindProviders(...providers) {
    providers.forEach((provider) => {
      provider({ registry: this.services });
    });

    return this;
  }

  /**
   * Unbinds services from the registry.
   * @param {...string} names - The names of the services to remove.
   * @returns {Dispatcher} The instance this method was called on.
   */
  unbindServices(...names) {
    names.forEach((name) => {
      this.services.unbind(name);
    });

    return this;
  }

  /**
   * Registers a client with this dispatcher.
   * @param {Ghastly} client - The client.
   */
  register(client) {
    const dispatchHandler = this.dispatch.bind(this);

    this.client = client;

    client.on('message', dispatchHandler);
    client.on('messageUpdate', dispatchHandler);
    this.onClientAttach();
  }

  /**
   * Called when a client has been registered with the dispatcher.
   * @private
   */
  onClientAttach() {}
}

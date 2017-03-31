import createResolver from './createResolver';

/**
 * @classdesc Base class for creating options resolvers.
 * @ignore
 */
export default class BaseResolver {
  /**
   * Constructor.
   */
  constructor() {
    this.resolver = createResolver();
  }

  /**
   * Validates the given options object and returns a promise.
   * @param {Object} [options={}] - Options object to resolve.
   * @returns {Object}
   */
  resolve(options = {}) {
    return this.resolver.resolve(options, false);
  }
}

import createResolver from 'options-resolver';

/**
 * Base class for creating options resolvers.
 */
export default class BaseResolver {
  constructor() {
    this._resolver = createResolver();
  }

  /**
   * Validates the given options object and returns a promise.
   * @param {Object} [options] - Options object to resolve.
   * @returns {Promise}
   */
  resolve(options = {}) {
    return this._resolver.resolve(options);
  }
}

import createResolver from 'options-resolver';
import BaseResolver from './BaseResolver';

/**
 * Options resolver for command classes.
 * @extends {BaseResolver}
 */
export default class CommandResolver extends BaseResolver {
  constructor() {
    super();
    this._resolver.setRequired([
      'action',
      'name',
      'prefix',
    ]).setDefined([
      'aliases',
      'description',
      'restrictions',
      'usage',
    ]).setAllowedTypes('action', 'function')
      .setAllowedTypes('name', 'string')
      .setAllowedTypes('prefix', 'string')
      .setAllowedTypes('aliases', 'array')
      .setAllowedTypes('description', 'string')
      .setAllowedTypes('restrictions', 'plainObject')
      .setAllowedTypes('usage', 'string');
  }

  /**
   * Resolves an object containing options for a command.
   * @param {Object} [options={}] - Options to resolve.
   * @returns {Promise<Object>}
   */
  async resolve(options = {}) {
    try {
      const resolvedOptions = await super.resolve(options);

      // resolve the restrictions object, if necessary
      if ('restrictions' in resolvedOptions) {
        const restrictionsResolver = createResolver();
        restrictionsResolver.setDefined([
          'permissions',
          'roleIds',
          'roleNames',
          'userIds',
        ]).setAllowedTypes('permissions', ['string', 'array'])
          .setAllowedTypes('roleIds', 'array')
          .setAllowedTypes('roleNames', 'array')
          .setAllowedTypes('userIds', 'array');

        resolvedOptions.restrictions = await restrictionsResolver.resolve(resolvedOptions);
      }

      return resolvedOptions;
    } catch (e) {
      process.nextTick(() => {
        throw e;
      });
    }
  }
}

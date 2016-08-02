import BaseResolver from './BaseResolver';
import createResolver from 'options-resolver';

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
      .setAllowedTypes('usage', 'string')
      .setAllowedValues('restrictions', value => {
        const resolver = createResolver();
        resolver.setDefined([
          'permissions',
          'roleIds',
          'roleNames',
          'userIds',
        ]).setAllowedTypes('permissions', ['string', 'array'])
          .setAllowedTypes('roleIds', 'array')
          .setAllowedTypes('roleNames', 'array')
          .setAllowedTypes('userIds', 'array');

        resolver.resolve(value);
      });
  }

  /**
   * Resolves an object containing options for a command.
   * @param {Object} [options={}] - Options to resolve.
   * @returns {Promise}
   */
  resolve(options = {}) {
    return super.resolve(options).then(resolved => {
      // resolve the restrictions object, if necessary
      if (resolved.hasOwnProperty('restrictions')) {
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

        return restrictionsResolver.resolve(resolved).then(restrictions => {
          resolved.restrictions = restrictions;

          return resolved;
        }).catch(e => {
          process.nextTick(() => {
            throw e;
          });
        });
      }

      return resolved;
    });
  }
}

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
}

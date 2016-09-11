import BaseResolver from './BaseResolver';
import createResolver from './createResolver';

/**
 * Options resolver for command classes.
 * @extends BaseResolver
 */
export default class CommandResolver extends BaseResolver {
  constructor() {
    super();

    this._resolver.setRequired([
      'signature',
      'handle',
    ]).setDefaults({
      description: 'No description set for this command.',
      filters: {
        permissions: {},
        roleNames: [],
        roleIds: [],
        userIds: [],
      },
    }).setAllowedTypes('signature', 'string')
      .setAllowedTypes('handle', 'function')
      .setAllowedTypes('description', 'string')
      .setAllowedTypes('filters', 'plainObject')
      .setAllowedValues('filters', (value) => {
        const filtersResolver = createResolver();
        filtersResolver.setDefined('permissions')
          .setDefined('roleNames')
          .setDefined('roleIds')
          .setDefined('userIds')
          .setAllowedTypes('permissions', ['string', 'plainObject'])
          .setAllowedTypes('roleNames', 'array')
          .setAllowedTypes('roleIds', 'array')
          .setAllowedTypes('userIds', 'array');

        try {
          filtersResolver.resolve(value, false);

          return true;
        } catch (error) {
          return false;
        }
      });
  }
}

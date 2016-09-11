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
        bot: false,
        permissions: {},
        roleNames: [],
        roleIds: [],
        userIds: [],
        usernames: [],
      },
    }).setAllowedTypes('signature', 'string')
      .setAllowedTypes('handle', 'function')
      .setAllowedTypes('description', 'string')
      .setAllowedTypes('filters', 'plainObject')
      .setAllowedValues('filters', (value) => {
        const filtersResolver = createResolver();
        filtersResolver.setDefined('bot')
          .setDefined('permissions')
          .setDefined('roleNames')
          .setDefined('roleIds')
          .setDefined('userIds')
          .setDefined('usernames')
          .setAllowedTypes('bot', 'boolean')
          .setAllowedTypes('permissions', ['string', 'plainObject'])
          .setAllowedTypes('roleNames', 'array')
          .setAllowedTypes('roleIds', 'array')
          .setAllowedTypes('userIds', 'array')
          .setAllowedTypes('usernames', 'array');

        try {
          const { permissions, roleNames, roleIds, userIds, usernames, ...rest } = value;
          filtersResolver.resolve({
            permissions,
            roleNames,
            roleIds,
            userIds,
            usernames,
          }, false);

          return true;
        } catch (error) {
          return false;
        }
      });
  }
}

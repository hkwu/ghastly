import BaseResolver from './BaseResolver';
import createResolver from './createResolver';
import { MENTIONABLE_ALLOW, MENTIONABLE_DENY, MENTIONABLE_ONLY } from '../Commands/Command';

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
      mentionable: MENTIONABLE_ALLOW,
      namespace: null,
      onBadArgs: (message) => {},
    }).setAllowedTypes('signature', 'string')
      .setAllowedTypes('handle', 'function')
      .setAllowedTypes('description', 'string')
      .setAllowedTypes('filters', 'plainObject')
      .setAllowedTypes('mentionable', 'string')
      .setAllowedTypes('namespace', ['string', 'null'])
      .setAllowedTypes('onBadArgs', 'function')
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
      })
      .setAllowedValues('mentionable', [MENTIONABLE_ALLOW, MENTIONABLE_DENY, MENTIONABLE_ONLY])
      .setAllowedValues('namespace', value => (value ? !/\s/.test(value) : true));
  }
}

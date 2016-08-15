import createResolver from '../Utils/createResolver';
import BaseResolver from './BaseResolver';

/**
 * Options resolver for command classes.
 * @extends {BaseResolver}
 */
export default class CommandResolver extends BaseResolver {
  constructor() {
    super();

    this._resolver.setRequired([
      'name',
      'action',
    ]).setDefaults({
      prefix: '',
      aliases: [],
      description: 'No description set for this command.',
      usage: 'No usage information for this command.',
    }).setDefined('filters')
      .setAllowedTypes('name', 'string')
      .setAllowedTypes('action', 'function')
      .setAllowedTypes('prefix', 'string')
      .setAllowedTypes('aliases', 'array')
      .setAllowedTypes('description', 'string')
      .setAllowedTypes('filters', 'plainObject')
      .setAllowedTypes('usage', 'string')
      .setAllowedValues('name', value => value && !/\s/.test(value))
      .setAllowedValues('prefix', value => !/\s/.test(value));
  }

  /**
   * @inheritDoc
   */
  resolve(options = {}) {
    const resolvedOptions = super.resolve(options);

    // resolve the restrictions object
    const filterResolver = createResolver();
    filterResolver.setDefaults({
      permissions: {},
      roleNames: [],
      roleIds: [],
      userIds: [],
    }).setAllowedTypes('permissions', ['string', 'plainObject'])
      .setAllowedTypes('roleNames', 'array')
      .setAllowedTypes('roleIds', 'array')
      .setAllowedTypes('userIds', 'array');

    resolvedOptions.filters = filterResolver.resolve(resolvedOptions.filters, false);

    return resolvedOptions;
  }
}

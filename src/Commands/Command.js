import { keyBy } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';
import { forOwn } from 'lodash/object';
import CommandResolver from '../Resolvers/CommandResolver';

/**
 * Base class for creating commands received in messages.
 */
export default class Command {
  constructor() {
    const resolver = new CommandResolver();
    this._resolvedStructure = resolver.resolve(this.structure);
  }

  /**
   * Returns an object containing information about the command.
   * @returns {Object}
   */
  get structure() {
    return {};
  }

  /**
   * Calls the predefined action method of this command on the given message.
   * @param {Message} message - Message object containing the command.
   * @param {String} messageContent - Content of message, stripped of the prefix and command.
   * @returns {*}
   */
  handle(message, messageContent) {
    if (this._isFilterable(message)) {
      return;
    }

    return this._resolvedStructure.action(message, messageContent);
  }

  /**
   * Determines whether or not a command can be filtered out based on defined filters.
   * @param {Message} message - The message containing the command.
   * @returns {boolean} True if command is filterable, else false.
   * @private
   */
  _isFilterable(message) {
    if (this._resolvedStructure.filters) {
      const filters = this._resolvedStructure.filters;

      // filter by permissions
      const channelPermissions = message.channel.isPrivate
        ? null
        : message.channel.permissionsOf(message.author).serialize();

      if (channelPermissions) {
        let permissionsMatchFilters = true;

        forOwn(filters.permissions, (value, key) => {
          // the values of the permissions in the filter object and the channel permissions object must match
          if ((value && !channelPermissions[key]) || (!value && channelPermissions[key])) {
            permissionsMatchFilters = false;

            return false;
          }
        });

        if (!permissionsMatchFilters) {
          return false;
        }
      }

      // generate maps for efficiency
      const userRoleNameIndex = keyBy(filters.roleNames);
      const userRoleIdIndex = keyBy(filters.roleIds);
      const userIdIndex = keyBy(filters.userIds);

      // filter by user ID
      if (!isEmpty(userIdIndex) && !userIdIndex[message.author.id]) {
        return false;
      }

      const userRoles = message.server ? message.server.rolesOfUser(message.author) : [];
      let rolesMatchFilters = false;

      // filter by role name and ID
      for (const role of userRoles) {
        if (userRoleNameIndex[role.name] || userRoleIdIndex[role.id]) {
          rolesMatchFilters = true;

          break;
        }
      }

      if (message.server && !rolesMatchFilters) {
        return false;
      }
    }

    return true;
  }
}

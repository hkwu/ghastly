import { forOwn, has } from 'lodash/object';
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
    if (has(this._resolvedStructure, 'filters')) {
      const filters = this._resolvedStructure.filters;

      // filter by permissions
      const userRoles = message.server.rolesOfUser(message.author);

      for (const role of userRoles) {
        let roleMatchesPermissions = true;

        forOwn(filters.permissions, (value, key) => {
          if ((value && !role.hasPermission(key)) || (!value && role.hasPermission(key))) {
            roleMatchesPermissions = false;

            return false;
          }
        });

        if (!roleMatchesPermissions) {
          return false;
        }
      }

      // generate maps for efficiency
      const userRoleNameMap = {};
      const userRoleIdMap = {};

      userRoles.forEach((element) => {
        userRoleNameMap[element.name] = true;
        userRoleIdMap[element.id] = true;
      });

      // we can filter by role names, role IDs, and user IDs in one pass
      const validCredentials = [
        ...filters.roleNames,
        ...filters.roleIds,
        ...filters.userIds,
      ].filter(element => userRoleNameMap[element] || userRoleIdMap[element] || message.author.id === element);

      return validCredentials.length > 0;
    }

    return true;
  }
}

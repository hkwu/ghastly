import CommandResolver from '../Resolvers/CommandResolver';
import generateFilter from './generateFilter';
import { permissions, roleNames, roleIds, userIds } from './Filters';

/**
 * Base class for creating commands received in messages.
 */
export default class Command {
  constructor() {
    const resolver = new CommandResolver();
    this._resolvedStructure = resolver.resolve(this.structure);
    this._filter = generateFilter({
      permissions,
      roleNames,
      roleIds,
      userIds,
    });
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
    return this._resolvedStructure.filters
      ? this._filter(this._resolvedStructure.filters, message)
      : false;
  }
}

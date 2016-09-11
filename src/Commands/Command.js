import { isEmpty } from 'lodash/lang';
import CommandResolver from '../Resolvers/CommandResolver';
import SignatureParser from './Parsers/SignatureParser';
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

    ({ identifiers: this.identifiers, parameters: this.parameters } = SignatureParser.parse(this._resolvedStructure.signature));
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
   * @param {Object} args - Arguments extracted from the command message.
   * @returns {*}
   */
  handle(message, args) {
    if (this._isFilterable(message)) {
      return false;
    }

    return this._resolvedStructure.handle(message, args);
  }

  /**
   * Determines whether or not a command can be filtered out based on defined filters.
   * @param {Message} message - The message containing the command.
   * @returns {boolean} True if command is filterable, else false.
   * @private
   */
  _isFilterable(message) {
    return isEmpty(this._resolvedStructure.filters)
      ? false
      : this._filter(this._resolvedStructure.filters, message);
  }
}

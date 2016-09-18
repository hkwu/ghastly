import { isEmpty } from 'lodash/lang';
import { merge } from 'lodash/object';
import CommandResolver from '../Resolvers/CommandResolver';
import SignatureParser from './Parsers/SignatureParser';
import coreFilters from './Filters/coreFilters';
import generateFilter from './Filters/generateFilter';

/**
 * Allow mention triggers for commands.
 * @type {String}
 */
export const MENTIONABLE_ALLOW = 'allow';

/**
 * Disallow mention triggers for commands.
 * @type {String}
 */
export const MENTIONABLE_DENY = 'deny';

/**
 * Allow only mention triggers for commands.
 * @type {String}
 */
export const MENTIONABLE_ONLY = 'only';

/**
 * Base class for creating commands received in messages.
 */
export default class Command {
  constructor() {
    const resolver = new CommandResolver();
    this._resolvedStructure = resolver.resolve(merge(
      { ...this.structure },
      {
        signature: this.signature,
        handle: this.handle,
        description: this.description,
        filters: this.filters,
        mentionable: this.mentionable,
        namespace: this.namespace,
      },
    ));

    this._filter = generateFilter(coreFilters);
    ({ identifiers: this.identifiers, parameters: this.parameters } = SignatureParser.parse(this._resolvedStructure.signature));
  }

  /**
   * Object containing information on the command.
   * @type {Object}
   */
  get structure() {
    return {};
  }

  /**
   * Determines how the command responds to mentions.
   * @type {String}
   */
  get mentionable() {
    return this._resolvedStructure.mentionable;
  }

  /**
   * The namespace of the command, used as a prefix.
   * @type {?String}
   */
  get namespace() {
    return this._resolvedStructure.namespace;
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

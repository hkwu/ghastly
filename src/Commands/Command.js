import { isEmpty } from 'lodash/lang';
import { mapValues, merge } from 'lodash/object';
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
    const resolvedStructure = resolver.resolve(merge(
      this.structure,
      {
        signature: this.signature,
        handle: this.handle,
        caseInsensitive: this.caseInsensitive,
        description: this.description,
        filters: this.filters,
        mentionable: this.mentionable,
        namespace: this.namespace,
        onBadArgs: this.onBadArgs,
      },
    ));

    const { identifiers, parameters } = SignatureParser.parse(resolvedStructure.signature);
    Object.defineProperties(this, mapValues({
      ...resolvedStructure,
      identifiers,
      parameters,
    }, value => ({
      enumerable: true,
      value,
    }));

    this._filter = generateFilter(coreFilters);
  }

  /**
   * Object containing information on the command.
   * @type {Object}
   */
  get structure() {
    return {};
  }

  /**
   * Whether or not the command accepts triggers based on a RegEx pattern.
   * @returns {Boolean}
   */
  get regexTriggerable() {
    return this._identifiers.some(alias => alias instanceof RegExp);
  }

  /**
   * Calls the predefined action method of this command on the given message.
   * @param {Message} message - Message object containing the command.
   * @param {Object} args - Arguments extracted from the command message.
   * @returns {*}
   */
  action(message, args) {
    if (this._isFilterable(message)) {
      return false;
    }

    return this.handle.call(this, message, args);
  }

  /**
   * Determines whether or not a command can be filtered out based on defined filters.
   * @param {Message} message - The message containing the command.
   * @returns {boolean} True if command is filterable, else false.
   * @private
   */
  _isFilterable(message) {
    return isEmpty(this.filters)
      ? false
      : this._filter(this.filters, message);
  }
}

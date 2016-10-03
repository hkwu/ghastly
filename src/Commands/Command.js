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
        caseInsensitive: this.caseInsensitive,
        description: this.description,
        filters: this.filters,
        mentionable: this.mentionable,
        namespace: this.namespace,
        onBadArgs: this.onBadArgs,
      },
    ));

    this._filter = generateFilter(coreFilters);
    ({
      identifiers: this._identifiers,
      parameters: this._parameters,
    } = SignatureParser.parse(this._resolvedStructure.signature));
  }

  /**
   * Object containing information on the command.
   * @type {Object}
   */
  get structure() {
    return {};
  }

  /**
   * Object containing the validated command configuration.
   * @type {Object}
   */
  get resolvedStructure() {
    return this._resolvedStructure;
  }

  /**
   * The identifiers parsed from the command signature.
   * @type {Array.<String>}
   */
  get identifiers() {
    return this._identifiers;
  }

  /**
   * The parameters parsed from the command signature.
   * @type {Array.<Object>}
   */
  get parameters() {
    return this._parameters;
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

import { isString } from 'lodash/lang';
import PrefixFilter from './PrefixFilter';

/**
 * Filters out messages based on a RegEx.
 * @implements {PrefixFilter}
 * @ignore
 */
export default class RegexFilter extends PrefixFilter {
  /**
   * @param {string} filter - The filter.
   * @throws {TypeError} Thrown if the filter is not a string.
   */
  constructor(filter) {
    if (!isString(filter)) {
      throw new TypeError('Expected filter to be a string.');
    }

    super(new RegExp(filter));
  }

  /**
   * Tests a message and determines if it passes the filter.
   * @param {Message} message - The message.
   * @returns {boolean} `true` if the message passes the filter, else `false`.
   */
  test(message) {
    return this.filter.test(message.content);
  }
}

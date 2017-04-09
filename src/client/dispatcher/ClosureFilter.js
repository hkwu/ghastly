import { isFunction } from 'lodash/lang';
import PrefixFilter from './PrefixFilter';

/**
 * Filters out messages based on the return value of a closure.
 * @implements {PrefixFilter}
 * @ignore
 */
export default class ClosureFilter extends PrefixFilter {
  /**
   * Constructor.
   * @param {Function} filter - The filter.
   * @throws {TypeError} Thrown if the filter is not a function.
   */
  constructor(filter) {
    if (!isFunction(filter)) {
      throw new TypeError('Expected filter to be a function.');
    }

    super(filter);
  }

  /**
   * Tests a message and determines if it passes the filter.
   * @param {Message} message - The message.
   * @returns {boolean} `true` if the message passes the filter, else `false`.
   */
  test(message) {
    return this.filter(message);
  }
}

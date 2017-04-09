/**
 * Filters out messages based on a prefix.
 * @interface
 * @ignore
 */
export default class PrefixFilter {
  /**
   * Constructor.
   * @param {*} filter - The filter.
   */
  constructor(filter) {
    /**
     * The filter.
     * @type {*}
     */
    this.filter = filter;
  }

  /**
   * Tests a message and determines if it passes the filter.
   * @param {Message} message - The message.
   * @returns {boolean} `true` if the message passes the filter, else `false`.
   * @abstract
   */
  test(message) { // eslint-disable-line no-unused-vars
    throw new Error(`test() was not implemented in ${this.constructor.name}.`);
  }
}

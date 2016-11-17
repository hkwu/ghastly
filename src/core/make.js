import CommandRegistry from '../command/CommandRegistry';

/**
 * Generates a Ghastly client constructor given a Discord.js client.
 * @param {Function} client - The Discord.js client constructor which acts as
 *   the base for the returned client.
 * @returns {Function} The Ghastly client constructor.
 */
export default client => (
  /**
   * @classdesc The Ghastly client class.
   */
  class Ghastly extends client {
    /**
     * Constructor.
     * @param {Object} [options={}] - Options to configure the client.
     */
    constructor(options = {}) {
      super(options);

      /**
       * The command registry for the client.
       * @type {CommandRegistry}
       */
      this.registry = new CommandRegistry();
    }
  }
);

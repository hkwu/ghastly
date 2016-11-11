/**
 * Generates a Ghastly client given a Discord.js client.
 * @param {Function} discordClient - The Discord.js client constructor which acts as the base for the returned client.
 * @param {Object} [clientOptions={}] - Options to specify configuration upon creation of the client.
 * @returns {Ghastly} The Ghastly client.
 */
export default (discordClient, clientOptions = {}) => (
  new (class extends discordClient {
    /**
     * Constructor.
     * @param {Object} [options={}] - Options to configure the client.
     */
    constructor(options = {}) {
      const { ...discordOptions } = options;
      super(discordOptions);
    }

    addCommand(command) {
      return this;
    }
  })(clientOptions)
);

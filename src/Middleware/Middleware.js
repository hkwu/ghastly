/**
 * Handles a single middleware process.
 */
export default class Middleware {
  /**
   * Method that is called when data needs to pass through this middleware.
   * @param {Function} next - Callback used to pass the processed values to the next middleware in line.
   * @param {Client} client - The Discord client.
   * @param {*} args - Other arguments passed in by Discord.js event emitters.
   */
  handle(next, client, ...args) {
    return next(client, ...args);
  }
}

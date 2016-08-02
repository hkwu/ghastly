import CommandResolver from '../Resolvers/CommandResolver';
import NotImplementedError from '../Errors/NotImplementedError';

/**
 * Base class for creating commands received in messages.
 */
export default class Command {
  constructor() {
    const resolver = new CommandResolver();
    resolver.resolve(this.structure).then(options => {
      this._resolvedStructure = options;
    });
  }

  /**
   * Returns an object containing information about the command.
   * @returns {Object}
   */
  get structure() {
    throw new NotImplementedError('Command.structure must be defined in subclass.');
  }
}

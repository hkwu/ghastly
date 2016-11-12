import CommandObject from '../command/CommandObject';
import compose from './compose';

/**
 * Takes a set of middleware functions and returns a function which consumes a
 *   single CommandObject and produces a new CommandObject with the given
 *   middleware applied to it.
 * @param {...Function} middleware - The set of middleware to apply to the input
 *   handler.
 * @returns {Function} Function consuming a single CommandObject and producing
 *   a new CommandObject with the given middleware applied to it.
 */
export default (...middleware) => (command) => {
  const newCommand = new CommandObject(command);
  newCommand.handler = compose(...middleware, command.handler);

  return newCommand;
};

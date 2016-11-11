import ArgumentParserError from '../../errors/ArgumentParserError';
import * as Constants from './Constants';

/**
 * Handles parsing of commands given by users.
 */
export default class ArgumentParser {
  /**
   * Parses an array of arguments for a command call.
   * @param {Array.<Object>} rules - An array of rules for the command being evaluated whose
   *   order matches that of the arguments.
   * @param {Array.<String>} args - The set of arguments for the command.
   * @returns {Object} The parsed arguments given in a mapping between argument names and values.
   * @throws {ArgumentParserError} Thrown if required arguments are missing.
   */
  static parse(rules, args) {
    const parsed = {};

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (!rule.optional && args[i] === undefined) {
        throw new ArgumentParserError(`Missing a value for required argument: <${rule.name}>.`);
      }

      if (rule.arity === Constants.TOKEN.ARITY.VARIADIC) {
        if (args[i] === undefined) {
          parsed[rule.name] = rule.defaultValue;

          return parsed;
        }

        parsed[rule.name] = [];

        for (let j = i; j < args.length; ++j) {
          parsed[rule.name].push(ArgumentParser.normalizeArgumentType(rule.type, args[j]));
        }

        return parsed;
      }

      parsed[rule.name] = args[i] === undefined
        ? rule.defaultValue
        : ArgumentParser.normalizeArgumentType(rule.type, args[i]);
    }

    return parsed;
  }

  /**
   * Converts an argument to the given type, ignoring string arguments.
   * @param {String} type - The type the argument should be converted to.
   * @param {String} argument - The argument to convert.
   * @returns {*} The converted argument.
   * @throws {ArgumentParserError} Thrown if the argument is not convertable to the specified type.
   */
  static normalizeArgumentType(type, argument) {
    if (type === Constants.TOKEN.TYPE.STRING) {
      return argument;
    } else if (!Constants.TYPE_CHECKERS[type](argument)) {
      throw new ArgumentParserError(`Expected argument <${argument}> to be of type <${type}>.`);
    }

    return Constants.TYPE_CONVERTERS[type](argument);
  }
}

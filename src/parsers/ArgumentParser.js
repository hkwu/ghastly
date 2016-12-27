import { isUndefined } from 'lodash/lang';
import ArgumentParserError from '../errors/ArgumentParserError';
import { TYPE_CHECKERS, TYPE_CONVERTERS } from './Constants';

/**
 * @classdesc Handles parsing of commands given by users.
 */
export default class ArgumentParser {
  /**
   * Parses an array of arguments for a command call.
   * @param {Array.<ParsedParameter>} rules - An array of rules for the command
   *   being evaluated whose order matches that of the arguments.
   * @param {Array.<string>} args - The set of arguments for the command.
   * @returns {Object} The parsed arguments given in a mapping between argument
   *   names and values.
   * @throws {ArgumentParserError} Thrown if required arguments are missing.
   */
  static parse(rules, args) {
    const parsed = {};

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (!rule.optional && isUndefined(args[i])) {
        throw new ArgumentParserError(`Missing a value for required argument: '${rule.name}'.`);
      } else if (rule.repeatable || rule.literal) {
        if (isUndefined(args[i])) {
          // put the default value in and return since there's no other args
          parsed[rule.name] = rule.defaultValue;

          return parsed;
        }

        const rest = [];

        // get the rest of the arguments
        for (let j = i; j < args.length; ++j) {
          rest.push(ArgumentParser.normalizeArgumentType(rule.type, args[j]));
        }

        parsed[rule.name] = rule.literal ? rest.join(' ') : rest;

        return parsed;
      }

      // get the arg or default value if no arg is given
      parsed[rule.name] = isUndefined(args[i])
        ? rule.defaultValue
        : ArgumentParser.normalizeArgumentType(rule.type, args[i]);
    }

    return parsed;
  }

  /**
   * Converts an argument to the given type, ignoring string arguments.
   * @param {string} type - The type the argument should be converted to.
   * @param {string} argument - The argument to convert.
   * @returns {ParameterType} The converted argument.
   * @throws {ArgumentParserError} Thrown if the argument is not convertable to
   *   the specified type.
   */
  static normalizeArgumentType(type, argument) {
    const checker = TYPE_CHECKERS[type];
    const converter = TYPE_CONVERTERS[type];

    if (!checker(argument)) {
      throw new ArgumentParserError(`Expected argument '${argument}' to be of type '${type}'.`);
    }

    return converter(argument);
  }
}

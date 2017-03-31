import stringArgv from 'string-argv';
import { isUndefined } from 'lodash/lang';
import ArgumentParserError from '../../errors/ArgumentParserError';
import { convertType, isType } from './Types';

/**
 * @classdesc Handles parsing of commands given by users.
 * @ignore
 */
export default class ArgumentParser {
  /**
   * Parses an array of arguments for a command call.
   * @param {ParsedParameter[]} rules - An array of rules for the command being
   *   evaluated whose order matches that of the arguments.
   * @param {string} args - A string containing the arguments for this command.
   * @returns {Object} The parsed arguments given in a mapping between argument
   *   names and values.
   * @throws {ArgumentParserError} Thrown if required arguments are missing.
   * @static
   */
  static parse(rules, args) {
    const delimited = stringArgv(args);
    const parsed = {};

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (!rule.optional && isUndefined(delimited[i])) {
        throw new ArgumentParserError(`Missing a value for required argument: '${rule.name}'.`);
      } else if (rule.repeatable || rule.literal) {
        if (isUndefined(delimited[i])) {
          // put the default value in and return since there's no other args
          return {
            ...parsed,
            [rule.name]: rule.defaultValue,
          };
        }

        if (rule.repeatable) {
          const rest = [];

          // get the rest of the arguments
          for (let j = i; j < delimited.length; ++j) {
            rest.push(ArgumentParser.normalizeArgumentType(rule.type, delimited[j]));
          }

          return {
            ...parsed,
            [rule.name]: rest,
          };
        } else if (rule.literal) {
          // use the entire string as the argument value
          return {
            ...parsed,
            [rule.name]: args,
          };
        }
      }

      // get the arg or default value if no arg is given
      parsed[rule.name] = isUndefined(delimited[i])
        ? rule.defaultValue
        : ArgumentParser.normalizeArgumentType(rule.type, delimited[i]);
    }

    return parsed;
  }

  /**
   * Converts an argument to the given type, ignoring string arguments.
   * @param {string} type - The type the argument should be converted to.
   * @param {string} argument - The argument to convertType.
   * @returns {ParameterType} The converted argument.
   * @throws {ArgumentParserError} Thrown if the argument is not convertable to
   *   the specified type.
   * @static
   */
  static normalizeArgumentType(type, argument) {
    if (!isType(argument, type)) {
      throw new ArgumentParserError(`Expected argument '${argument}' to be of type '${type}'.`);
    }

    return convertType(argument, type);
  }
}

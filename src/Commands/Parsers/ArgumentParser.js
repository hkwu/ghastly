import stringArgv from 'string-argv';
import { isNumber, toInteger, toNumber } from 'lodash/lang';
import ArgumentParserError from '../../Errors/ArgumentParserError';
import * as Constants from './Constants';

/**
 * Handles parsing of commands given by users.
 */
export default class ArgumentParser {
  static parse(rules, args) {
    const parsed = {};

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (!rule.optional && args[i] === undefined) {
        throw new ArgumentParserError();
      } else if (rule.arity === Constants.TOKEN.ARITY.VARIADIC) {
        parsed[rule.name] = [];

        for (let j = i; j < args.length; ++j) {
          parsed[rule.name].push(args[j]);
        }

        if (!rule.optional && !parsed[rule.name].length) {
          throw new ArgumentParserError();
        }

        break;
      }

      const argument = args[i];
      parsed[rule.name] = argument === undefined ? rule.defaultValue : argument;
    }

    return parsed;
  }
}

import stringArgv from 'string-argv';
import { isString } from 'lodash/lang';
import { trimEnd, trimStart } from 'lodash/string';
import ParameterParserError from '../errors/ParameterParserError';
import { TYPES, TYPE_CHECKERS, TYPE_CONVERTERS } from './Constants';

/**
 * One of the types that a command parameter is allowed to take.
 * @typedef {(boolean|number|string)} ParameterType
 */

/**
 * An object containing data that was parsed out of a parameter definition string.
 * @typedef {Object} ParsedParameter
 * @property {string} name - The name of the parameter.
 * @property {boolean} optional - True if the parameter is optional, else false.
 * @property {?string} description - A description of the parameter.
 * @property {string} type - The expected type of the parameter.
 * @property {boolean} repeatable - True if the parameter accepts a variable
 *   number of input arguments, else false.
 * @property {?(ParameterType|Array.<ParameterType>)} defaultValue - The default
 *   value of the parameter. This is non-null only if the parameter is optional.
 *   The default value for a repeatable parameter will be an array of values
 *   while non-repeatable parameters store a single primitive as a default value.
 *   The types of these values are determined by the parameters's type declaration
 *   defaulting to strings.
 */

/**
 * @classdesc Parses a command parameter definition string.
 */
export default class ParameterParser {
  /**
   * Parses the given command parameter definition and returns an
   * @param {String} parameter - The command parameter definition.
   * @returns {ParsedParameter} Object containing data on the command parameter.
   * @throws {ParameterParserError} Thrown if the parameter definition is not well-formed.
   * @throws {TypeError} Thrown if the parameter definition is not a string.
   * @example
   * ParameterParser.parse('-(int) num* : A parameter.');
   */
  static parse(parameter) {
    if (!isString(parameter)) {
      throw new TypeError('Expected parameter to be a string.');
    }

    const trimmed = parameter.trim();

    if (!trimmed) {
      throw new ParameterParserError('Parameter cannot be empty.');
    }

    const parsed = { description: null };
    // description?
    const matched = trimmed.match(/^(.+?)\s*:\s*(.+)$/);

    if (matched) {
      parsed.description = matched[2];
    }

    return {
      ...parsed,
      ...ParameterParser.parseDefinition(matched ? matched[1] : trimmed),
    };
  }

  /**
   * Parses the definition portion of a parameter string.
   * @param {string} definition - The definition portion of a parameter string.
   * @returns {Object} An object containing data on the parsed parameter definition.
   * @throws {ParameterParserError} Thrown if the parameter definition is not well-formed.
   * @example
   * ParameterParser.parseDefinition('-(int) num*');
   */
  static parseDefinition(definition) {
    const parsed = {
      name: null,
      optional: false,
      type: TYPES.STRING,
      repeatable: false,
      defaultValue: null,
    };

    let temp = definition;

    // optional parameter?
    if (temp.startsWith('-')) {
      parsed.optional = true;
      temp = trimStart(temp, '- ');
    } else if (temp.startsWith('+')) {
      temp = trimStart(temp, '+ ');
    }

    // type declaration?
    let matched = temp.match(/\(\s*(\w+)\s*\)\s*(.+)/);

    if (matched) {
      const declaredType = matched[1];
      const actualType = TYPES[declaredType.toUpperCase()];

      if (!actualType) {
        throw new ParameterParserError(`Unrecognized parameter type declaration: '${definition}'.`);
      }

      parsed.type = actualType;
      temp = matched[2];
    }

    // name, repeatable, default value?
    matched = temp.match(/(\w+\s*?\*?)\s*=\s*(.+)/);
    const name = matched ? matched[1] : temp;

    if (name.endsWith('*')) {
      parsed.name = trimEnd(name, '* ');
      parsed.repeatable = true;
      parsed.defaultValue = [];
    } else if (name.includes(' ')) {
      throw new ParameterParserError(`Parameter name must not contain spaces: '${definition}'.`);
    } else {
      parsed.name = name;
    }

    if (matched) {
      const defaults = stringArgv(matched[2]);
      // default value automatically makes it optional
      parsed.optional = true;

      if (!parsed.repeatable && defaults.length > 1) {
        throw new ParameterParserError(`Cannot provide more than one default argument for non-repeatable parameters: '${definition}'.`);
      }

      const typedDefaults = defaults.map((value) => {
        const checker = TYPE_CHECKERS[parsed.type];
        const converter = TYPE_CONVERTERS[parsed.type];

        if (!checker(value)) {
          throw new ParameterParserError(`Given default value '${value}' is not of the correct type: '${definition}'.`);
        }

        return converter(value);
      });

      parsed.defaultValue = parsed.repeatable ? typedDefaults : typedDefaults[0];
    }

    return parsed;
  }
}

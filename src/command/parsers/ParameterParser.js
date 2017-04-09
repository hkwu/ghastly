import stringArgv from 'string-argv';
import { isPlainObject, isString } from 'lodash/lang';
import { trimEnd, trimStart } from 'lodash/string';
import ParameterParserError from '../../errors/ParameterParserError';
import ParameterResolver from '../../resolvers/ParameterResolver';
import ParsedParameter from './ParsedParameter';
import { STRING, convertType, isType, resolveType } from './Types';

/**
 * @typedef {Object} ParameterDefinition
 * @property {string} name - The name of the parameter.
 * @property {string} description - The description of the parameter.
 * @property {boolean} optional - Whether or not the parameter is optional.
 * @property {string} type - The type of the parameter.
 * @property {boolean} repeatable - Whether or not the parameter accepts an array
 *   of values instead of an atomic value.
 * @property {boolean} literal - Whether or not this parameter gets the value of
 *   the entire input string.
 * @property {*} defaultValue - The default value of the parameter, or an array of
 *   default values if the parameter is repeatable.
 */

/**
 * @desc Parses and validates parameter definitions.
 * @ignore
 */
export default class ParameterParser {
  /**
   * Validates a set of parameters.
   * @param {...(ParameterDefinition|string)} parameters - The parameters to validate.
   * @returns {ParsedParameter[]} The validated parameters.
   * @throws {ParameterParserError} Thrown if an error is encountered during validation.
   */
  static validate(...parameters) {
    const parsed = ParameterParser.parse(...parameters);
    let seenRepeatable = false;
    let seenOptional = false;

    parsed.forEach((parameter) => {
      if (parameter.literal && parsed.length > 1) {
        throw new ParameterParserError('Literal parameters must be the only parameter in a command.');
      } else if (seenRepeatable) {
        throw new ParameterParserError('Repeatable parameters must be the last parameter in a command.');
      } else if (seenOptional && !parameter.optional) {
        throw new ParameterParserError('Cannot have required parameters after optional parameters in a command.');
      }

      seenRepeatable = seenRepeatable || parameter.repeatable;
      seenOptional = seenOptional || parameter.optional;
    });

    return parsed;
  }

  /**
   * Parses a set of parameters into `ParsedParameter` objects.
   * @param {...(ParameterDefinition|string)} parameters - The parameters to parse.
   * @returns {ParsedParameter[]} The parsed parameters.
   * @throws {ParameterParserError} Thrown if an error is encountered during parsing.
   */
  static parse(...parameters) {
    const resolver = new ParameterResolver();

    return parameters.map((parameter) => {
      if (isString(parameter)) {
        return new ParsedParameter(ParameterParser.parseParameter(parameter));
      } else if (isPlainObject(parameter)) {
        return new ParsedParameter(resolver.resolve(parameter));
      }

      throw new ParameterParserError('Expected parameter definition to be a plain object or string.');
    });
  }

  /**
   * Parses the given command parameter definition and returns an object
   *   containing data on it.
   * @param {String} parameter - The command parameter definition.
   * @returns {ParameterDefinition} Object containing data on the command parameter.
   * @throws {ParameterParserError} Thrown if the parameter definition is not
   *   well-formed.
   * @throws {TypeError} Thrown if the parameter definition is not a string.
   */
  static parseParameter(parameter) {
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
   * @throws {ParameterParserError} Thrown if the parameter definition is not
   *   well-formed.
   */
  static parseDefinition(definition) {
    const parsed = {
      name: null,
      optional: false,
      type: STRING,
      repeatable: false,
      literal: false,
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
      const actualType = resolveType(declaredType);

      if (!actualType) {
        throw new ParameterParserError(`Unrecognized parameter type declaration: '${definition}'.`);
      }

      parsed.type = actualType;
      temp = matched[2];
    }

    // name, repeatable, literal, default value?
    matched = temp.match(/(\w+\s*?[*+]?)\s*=\s*(.+)/);
    const name = matched ? matched[1] : temp;

    if (name.endsWith('*')) {
      parsed.name = trimEnd(name, '* ');
      parsed.repeatable = true;
      parsed.defaultValue = [];
    } else if (name.endsWith('...')) {
      if (parsed.type !== STRING) {
        throw new ParameterParserError(`Literals can only be used with string parameters: '${definition}'.`);
      }

      parsed.name = trimEnd(name, '. ');
      parsed.literal = true;
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
        if (!isType(value, parsed.type)) {
          throw new ParameterParserError(`Given default value '${value}' is not of the correct type: '${definition}'.`);
        }

        return convertType(value, parsed.type);
      });

      parsed.defaultValue = parsed.repeatable ? typedDefaults : typedDefaults[0];
    }

    return parsed;
  }
}

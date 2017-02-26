import ParameterValidatorError from '../errors/ParameterValidatorError';
import ParameterResolver from '../resolvers/ParameterResolver';

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
 * @classdesc Validates parameter definitions.
 */
export default class ParameterValidator {
  /**
   * Validates a set of parameters.
   * @param {...ParameterDefinition} parameters - The parameters to validate.
   * @returns {ParameterDefinition[]} The validated parameters.
   * @throws {ParameterValidatorError} Thrown if an error is encountered during validation.
   */
  static validate(...parameters) {
    const resolver = new ParameterResolver();
    const resolved = parameters.map(parameter => resolver.resolve(parameter));

    let seenRepeatable = false;
    let seenOptional = false;

    resolved.forEach((parameter) => {
      if (parameter.literal && resolved.length > 1) {
        throw new ParameterValidatorError('Literal parameters must be the only parameter in a command.');
      } else if (seenRepeatable) {
        throw new ParameterValidatorError('Repeatable parameters must be the last parameter in a command.');
      } else if (seenOptional && !parameter.optional) {
        throw new ParameterValidatorError('Cannot have required parameters after optional parameters in a command.');
      }

      seenRepeatable = seenRepeatable || parameter.repeatable;
      seenOptional = seenOptional || parameter.optional;
    });

    return resolved;
  }
}

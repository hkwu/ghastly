import { isNumber, isString, toInteger, toNumber } from 'lodash/lang';

/**
 * Boolean type.
 * @type {string}
 * @const
 */
export const BOOLEAN = 'boolean';

/**
 * Alias for Boolean type.
 * @type {string}
 * @const
 */
export const BOOL = 'bool';

/**
 * Integer type.
 * @type {string}
 * @const
 */
export const INTEGER = 'integer';

/**
 * Alias for Integer type.
 * @type {string}
 * @const
 */
export const INT = 'int';

/**
 * Number type.
 * @type {string}
 * @const
 */
export const NUMBER = 'number';

/**
 * Alias for Number type.
 * @type {string}
 * @const
 */
export const NUM = 'num';

/**
 * String type.
 * @type {string}
 * @const
 */
export const STRING = 'string';

/**
 * Alias for String type.
 * @type {string}
 * @const
 */
export const STR = 'str';

/**
 * Resolves a string value to a type string.
 * @param {string} value - The string.
 * @returns {?string} The resolved value type, or `null` if it could not be resolved.
 */
export const resolveType = (value) => {
  if (!isString(value)) {
    throw new TypeError('Expected value to be a string.');
  }

  switch (value.toLowerCase()) {
    case BOOLEAN:
    case BOOL:
      return 'boolean';
    case INTEGER:
    case INT:
      return 'integer';
    case NUMBER:
    case NUM:
      return 'number';
    case STRING:
    case STR:
      return 'string';
    default:
      return null;
  }
};

/**
 * Determines if a string value is of the expected type.
 * @param {string} value - The string.
 * @param {string} expectedType - The expected type.
 * @returns {boolean} `true` if the value is of the expected type, else `false`.
 */
export const isType = (value, expectedType) => {
  if (!isString(value)) {
    throw new TypeError('Expected value to be a string.');
  }

  switch (resolveType(expectedType)) {
    case BOOLEAN: {
      const lower = value.toLowerCase();

      return lower === 'true' || lower === 'false';
    }
    case INTEGER:
      return !isNaN(value) && isNumber(+value);
    case NUMBER:
      return !isNaN(value) && isNumber(+value);
    case STRING:
      return true;
    default:
      throw new Error(`Unrecognized type: ${expectedType}.`);
  }
};

/**
 * Converts a string value to a given type.
 * @param {string} value - The string.
 * @param {string} type - The type to convertType to.
 * @returns {*} The converted type, or the given string if it couldn't be converted
 *   to the given type.
 */
export const convertType = (value, type) => {
  if (!isString(value)) {
    throw new TypeError('Expected value to be a string.');
  }

  switch (resolveType(type)) {
    case BOOLEAN:
      return value.toLowerCase() === 'true';
    case INTEGER:
      return toInteger(value);
    case NUMBER:
      return toNumber(value);
    case STRING:
    default:
      return value;
  }
};

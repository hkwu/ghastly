import { isNumber, toInteger, toNumber } from 'lodash/lang';

/**
 * Constants for command signature parameters.
 * @type {Object}
 * @const
 */
export const TOKEN = {
  ARITY: {
    UNARY: 'UNARY',
    VARIADIC: 'VARIADIC',
  },
  TYPE: {
    BOOLEAN: 'BOOLEAN',
    BOOL: 'BOOLEAN',
    INTEGER: 'INTEGER',
    INT: 'INTEGER',
    NUMBER: 'NUMBER',
    NUM: 'NUMBER',
    STRING: 'STRING',
    STR: 'STRING',
  },
};

/**
 * Maps parameter types to type checking functions.
 * @type {Object}
 * @const
 */
export const TYPE_CHECKERS = {
  [TOKEN.TYPE.BOOLEAN]: (value) => {
    const lower = value.toLowerCase();

    return lower === 'true' || lower === 'false';
  },
  [TOKEN.TYPE.INTEGER]: value => !isNaN(value) && isNumber(+value),
  [TOKEN.TYPE.NUMBER]: value => !isNaN(value) && isNumber(+value),
};

/**
 * Maps parameter types to type conversion functions.
 * @type {Object}
 * @const
 */
export const TYPE_CONVERTERS = {
  [TOKEN.TYPE.BOOLEAN]: value => value === 'true',
  [TOKEN.TYPE.INTEGER]: toInteger,
  [TOKEN.TYPE.NUMBER]: toNumber,
};

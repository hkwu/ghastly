import { isNumber, toInteger, toNumber } from 'lodash/lang';

/**
 * Types that a command parameter may declare.
 * @type {Object}
 */
export const TYPES = {
  BOOLEAN: 'BOOLEAN',
  BOOL: 'BOOLEAN',
  INTEGER: 'INTEGER',
  INT: 'INTEGER',
  NUMBER: 'NUMBER',
  NUM: 'NUMBER',
  STRING: 'STRING',
  STR: 'STRING',
};

/**
 * Maps parameter types to type checking functions.
 * @type {Object}
 */
export const TYPE_CHECKERS = {
  [TYPES.BOOLEAN]: (value) => {
    const lower = value.toLowerCase();

    return lower === 'true' || lower === 'false';
  },
  [TYPES.INTEGER]: value => !isNaN(value) && isNumber(+value),
  [TYPES.NUMBER]: value => !isNaN(value) && isNumber(+value),
};

/**
 * Maps parameter types to type conversion functions.
 * @type {Object}
 */
export const TYPE_CONVERTERS = {
  [TYPES.BOOLEAN]: value => value === 'true',
  [TYPES.INTEGER]: toInteger,
  [TYPES.NUMBER]: toNumber,
};

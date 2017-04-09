/**
 * One of the types that a command parameter is allowed to take.
 * @typedef {(boolean|number|string)} ParameterType
 */

/**
 * @desc Wrapper for results returned from `ParameterParser`.
 * @ignore
 */
export default class ParsedParameter {
  /**
   * Constructor.
   * @param {ParameterDefinition} values - The parsed data.
   */
  constructor(values) {
    const {
      name,
      description = null,
      optional,
      type,
      repeatable,
      literal,
      defaultValue = null,
    } = values;

    /**
     * The name of the parameter.
     * @type {string}
     */
    this.name = name;

    /**
     * Whether or not the parameter is optional.
     * @type {boolean}
     */
    this.optional = optional;

    /**
     * A description of the parameter.
     * @type {?string}
     */
    this.description = description;

    /**
     * The expected type of the parameter.
     * @type {string}
     */
    this.type = type;

    /**
     * Whether or not the parameter accepts a variable number of input arguments.
     * @type {boolean}
     */
    this.repeatable = repeatable;

    /**
     * Whether or no the parameter is a literal string, i.e. takes the value of
     *   the input as given. Can only be applied to string parameters.
     * @type {boolean}
     */
    this.literal = literal;

    /**
     * The default value of the parameter. This is non-null only if the parameter
     *   is optional.
     * The default value for a repeatable parameter will be an array
     *   of values while non-repeatable parameters store a single primitive as a
     *   default value. The types of these values are determined by the parameters's
     *   type declaration defaulting to strings.
     * @type {?(ParameterType|ParameterType[])}
     */
    this.defaultValue = defaultValue;
  }
}

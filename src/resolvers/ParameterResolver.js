import BaseResolver from './BaseResolver';
import { STRING } from '../command/parsers/Types';

/**
 * @desc Options resolver for command parameter definitions.
 * @extends BaseResolver
 * @ignore
 */
export default class ParameterResolver extends BaseResolver {
  /**
   * Constructor.
   */
  constructor() {
    super();

    this.resolver.setRequired('name')
      .setDefaults({
        description: null,
        optional: false,
        type: STRING,
        repeatable: false,
        literal: false,
        defaultValue: options => (options.repeatable ? [] : null),
      })
      .setAllowedTypes('name', 'string')
      .setAllowedTypes('description', ['string', 'null'])
      .setAllowedTypes('optional', 'boolean')
      .setAllowedTypes('type', 'string')
      .setAllowedTypes('repeatable', 'boolean')
      .setAllowedTypes('literal', 'boolean');
  }
}

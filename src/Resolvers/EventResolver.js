import BaseResolver from './BaseResolver';

/**
 * Options resolver for Event class.
 * @extends BaseResolver
 */
export default class EventResolver extends BaseResolver {
  constructor() {
    super();

    this._resolver.setDefined([
      'middleware',
    ]).setAllowedTypes('middleware', 'array');
  }
}

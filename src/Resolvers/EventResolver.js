import BaseResolver from './BaseResolver';

/**
 * Options resolver for Event class.
 * @extends {BaseResolver}
 */
export default class EventResolver extends BaseResolver {
  constructor() {
    super();
    this._resolver.setDefined([
      'injectClient',
    ]).setAllowedTypes('injectClient', 'boolean');
  }

  /**
   * @inheritDoc
   */
  async resolve(options = {}) {
    try {
      return await this._resolver.resolve(options);
    } catch (e) {
      process.nextTick(() => {
        throw e;
      });
    }
  }
}

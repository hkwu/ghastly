import Service from './Service';

/**
 * @desc A service which is constructed once.
 * @implements {Service}
 * @ignore
 */
export default class SingletonService extends Service {
  /**
   * Constructor.
   * @param {string[]} aliases - Aliases for this entry.
   * @param {Function} builder - The service builder.
   */
  constructor(aliases, builder) {
    super({ aliases, builder });
  }

  /**
   * The service.
   * @type {*}
   */
  get service() {
    if (!this.instance) {
      this.instance = this.builder();
    }

    return this.instance;
  }
}

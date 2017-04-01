import Service from './Service';

/**
 * @desc A service which is reconstructed when fetched.
 * @implements {Service}
 * @ignore
 */
export default class ConstructedService extends Service {
  /**
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
    return this.builder();
  }
}

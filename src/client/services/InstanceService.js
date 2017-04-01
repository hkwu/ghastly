import Service from './Service';

/**
 * @desc A service which is stored as an instance.
 * @implements {Service}
 * @ignore
 */
export default class InstanceService extends Service {
  /**
   * @param {string[]} aliases - Aliases for this entry.
   * @param {*} instance - The service instance.
   */
  constructor(aliases, instance) {
    super({ aliases, instance });
  }

  /**
   * The service.
   * @type {*}
   */
  get service() {
    return this.instance;
  }
}

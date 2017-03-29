import { isString } from 'lodash/lang';

/**
 * @classdesc Specialization of builtin `Map` that only stores strings as keys.
 * @extends Map
 */
export default class StringMap extends Map {
  /**
   * Constructor.
   * @param {*} iterable - The iterable to use to construct the map.
   * @throws {TypeError} Thrown if any of the keys are not strings.
   */
  constructor(iterable) {
    if (iterable) {
      for (const [key] of iterable) {
        if (!isString(key)) {
          throw new TypeError('Expected keys to be strings.');
        }
      }
    }

    super(iterable);
  }

  /**
   * Removes a key from the map.
   * @param {string} key - The key to remove.
   * @returns {boolean} True if an element is removed, else false.
   * @throws {TypeError} Thrown if the key is not a string.
   */
  delete(key) {
    if (!isString(key)) {
      throw new TypeError('Expected key to be a string.');
    }

    return super.delete(key);
  }

  /**
   * Returns a value from the map.
   * @param {string} key - The key of the value to get.
   * @returns {(*|undefined)} The returned value if found, else `undefined`.
   * @throws {TypeError} Thrown if the key is not a string.
   */
  get(key) {
    if (!isString(key)) {
      throw new TypeError('Expected key to be a string.');
    }

    return super.get(key);
  }

  /**
   * Checks if a key exists in the map.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is found, else false.
   * @throws {TypeError} Thrown if the key is not a string.
   */
  has(key) {
    if (!isString(key)) {
      throw new TypeError('Expected key to be a string.');
    }

    return super.has(key);
  }

  /**
   * Sets a value in the map.
   * @param {string} key - The key of the value to add.
   * @param {*} value - The value to add.
   * @returns {StringMap} The instance this method was called on.
   * @throws {TypeError} Thrown if the key is not a string.
   */
  set(key, value) {
    if (!isString(key)) {
      throw new TypeError('Expected key to be a string.');
    }

    return super.set(key, value);
  }
}

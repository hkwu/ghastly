import Event from './Event';

/**
 * @extends Event
 */
export default class ErrorEvent extends Event {
  static get type() {
    return 'error';
  }
}

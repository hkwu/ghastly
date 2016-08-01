import Event from './Event';

/**
 * @extends Event
 */
export default class MessageEvent extends Event {
  static get type() {
    return 'message';
  }
}

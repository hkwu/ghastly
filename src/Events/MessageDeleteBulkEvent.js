import Event from './Event';

/**
 * @extends Event
 */
export default class MessageDeleteBulkEvent extends Event {
  static get type() {
    return 'messageDeleteBulk';
  }
}

import Event from './Event';

/**
 * @extends Event
 */
export default class MessageDeletedEvent extends Event {
  static get type() {
    return 'messageDeleted';
  }
}

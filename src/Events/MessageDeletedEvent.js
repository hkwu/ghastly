import Event from './Event';

export default class MessageDeletedEvent extends Event {
  static get type() {
    return 'messageDeleted';
  }
}

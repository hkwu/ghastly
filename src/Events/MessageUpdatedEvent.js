import Event from './Event';

export default class MessageUpdatedEvent extends Event {
  static get type() {
    return 'messageUpdated';
  }
}

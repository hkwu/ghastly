import Event from './Event';

/**
 * @extends Event
 */
export default class MessageUpdatedEvent extends Event {
  static get type() {
    return 'messageUpdated';
  }
}

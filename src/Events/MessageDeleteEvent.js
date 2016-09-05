import Event from './Event';

/**
 * @extends Event
 */
export default class MessageDeleteEvent extends Event {
  static get type() {
    return 'messageDelete';
  }
}

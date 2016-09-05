import Event from './Event';

/**
 * @extends Event
 */
export default class MessageUpdateEvent extends Event {
  static get type() {
    return 'messageUpdate';
  }
}

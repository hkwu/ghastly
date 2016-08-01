import Event from './Event';

/**
 * @extends Event
 */
export default class ServerCreatedEvent extends Event {
  static get type() {
    return 'serverCreated';
  }
}

import Event from './Event';

/**
 * @extends Event
 */
export default class ServerDeletedEvent extends Event {
  static get type() {
    return 'serverDeleted';
  }
}

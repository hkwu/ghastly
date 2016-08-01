import Event from './Event';

/**
 * @extends Event
 */
export default class ServerMemberUpdatedEvent extends Event {
  static get type() {
    return 'serverMemberUpdated';
  }
}

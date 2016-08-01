import Event from './Event';

/**
 * @extends Event
 */
export default class ServerRoleUpdatedEvent extends Event {
  static get type() {
    return 'serverRoleUpdated';
  }
}

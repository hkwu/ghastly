import Event from './Event';

/**
 * @extends Event
 */
export default class ServerRoleCreatedEvent extends Event {
  static get type() {
    return 'serverRoleCreated';
  }
}

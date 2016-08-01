import Event from './Event';

/**
 * @extends Event
 */
export default class ServerRoleDeletedEvent extends Event {
  static get type() {
    return 'serverRoleDeleted';
  }
}

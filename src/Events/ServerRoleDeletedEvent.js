import Event from './Event';

export default class ServerRoleDeletedEvent extends Event {
  static get type() {
    return 'serverRoleDeleted';
  }
}

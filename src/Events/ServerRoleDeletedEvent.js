import Event from './Event';

class ServerRoleDeletedEvent extends Event {
  static get type() {
    return 'serverRoleDeleted';
  }
}

export default ServerRoleDeletedEvent;

import Event from './Event';

class ServerRoleUpdatedEvent extends Event {
  static get type() {
    return 'serverRoleUpdated';
  }
}

export default ServerRoleUpdatedEvent;

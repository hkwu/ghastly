import Event from './Event';

class ServerRoleCreatedEvent extends Event {
  static get type() {
    return 'serverRoleCreated';
  }
}

export default ServerRoleCreatedEvent;

import Event from './Event.js';

class ServerRoleDeletedEvent extends Event {
  constructor() {
    super('serverRoleDeleted');
  }
}

export default ServerRoleDeletedEvent;

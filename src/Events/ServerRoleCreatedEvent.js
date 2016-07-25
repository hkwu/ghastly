import Event from './Event.js';

class ServerRoleCreatedEvent extends Event {
  constructor() {
    super('serverRoleCreated');
  }
}

export default ServerRoleCreatedEvent;

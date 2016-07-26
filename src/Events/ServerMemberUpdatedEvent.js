import Event from './Event';

class ServerMemberUpdatedEvent extends Event {
  static get type() {
    return 'serverMemberUpdated';
  }
}

export default ServerMemberUpdatedEvent;

import Event from './Event';

class ServerMemberRemovedEvent extends Event {
  static get type() {
    return 'serverMemberRemoved';
  }
}

export default ServerMemberRemovedEvent;

import Event from './Event';

class ServerNewMemberEvent extends Event {
  static get type() {
    return 'serverNewMember';
  }
}

export default ServerNewMemberEvent;

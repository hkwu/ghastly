import Event from './Event';

export default class ServerNewMemberEvent extends Event {
  static get type() {
    return 'serverNewMember';
  }
}

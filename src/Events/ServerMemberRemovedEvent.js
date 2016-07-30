import Event from './Event';

export default class ServerMemberRemovedEvent extends Event {
  static get type() {
    return 'serverMemberRemoved';
  }
}

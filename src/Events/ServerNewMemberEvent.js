import Event from './Event';

/**
 * @extends Event
 */
export default class ServerNewMemberEvent extends Event {
  static get type() {
    return 'serverNewMember';
  }
}

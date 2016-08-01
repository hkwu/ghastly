import Event from './Event';

/**
 * @extends Event
 */
export default class ServerMemberRemovedEvent extends Event {
  static get type() {
    return 'serverMemberRemoved';
  }
}

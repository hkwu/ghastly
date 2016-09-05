import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMemberUpdateEvent extends Event {
  static get type() {
    return 'guildMemberUpdate';
  }
}

import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMemberAddEvent extends Event {
  static get type() {
    return 'guildMemberAdd';
  }
}

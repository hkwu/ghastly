import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMemberAvailableEvent extends Event {
  static get type() {
    return 'guildMemberAvailable';
  }
}

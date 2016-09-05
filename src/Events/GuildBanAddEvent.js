import Event from './Event';

/**
 * @extends Event
 */
export default class GuildBanAddEvent extends Event {
  static get type() {
    return 'guildBanAdd';
  }
}

import Event from './Event';

/**
 * @extends Event
 */
export default class GuildCreateEvent extends Event {
  static get type() {
    return 'guildCreate';
  }
}

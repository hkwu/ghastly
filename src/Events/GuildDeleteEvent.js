import Event from './Event';

/**
 * @extends Event
 */
export default class GuildDeleteEvent extends Event {
  static get type() {
    return 'guildDelete';
  }
}

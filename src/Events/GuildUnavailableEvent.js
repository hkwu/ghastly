import Event from './Event';

/**
 * @extends Event
 */
export default class GuildUnavailableEvent extends Event {
  static get type() {
    return 'guildUnavailable';
  }
}

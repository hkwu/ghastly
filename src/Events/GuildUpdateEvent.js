import Event from './Event';

/**
 * @extends Event
 */
export default class GuildUpdateEvent extends Event {
  static get type() {
    return 'guildUpdate';
  }
}

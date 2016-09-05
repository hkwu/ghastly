import Event from './Event';

/**
 * @extends Event
 */
export default class GuildBanRemoveEvent extends Event {
  static get type() {
    return 'guildBanRemove';
  }
}

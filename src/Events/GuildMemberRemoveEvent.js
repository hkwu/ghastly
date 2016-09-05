import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMemberRemoveEvent extends Event {
  static get type() {
    return 'guildMemberRemove';
  }
}

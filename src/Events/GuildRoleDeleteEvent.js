import Event from './Event';

/**
 * @extends Event
 */
export default class GuildRoleDeleteEvent extends Event {
  static get type() {
    return 'guildRoleDelete';
  }
}

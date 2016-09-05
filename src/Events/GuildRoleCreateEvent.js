import Event from './Event';

/**
 * @extends Event
 */
export default class GuildRoleCreateEvent extends Event {
  static get type() {
    return 'guildRoleCreate';
  }
}

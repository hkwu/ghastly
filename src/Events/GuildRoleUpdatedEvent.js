import Event from './Event';

/**
 * @extends Event
 */
export default class GuildRoleUpdatedEvent extends Event {
  static get type() {
    return 'guildRoleUpdated';
  }
}

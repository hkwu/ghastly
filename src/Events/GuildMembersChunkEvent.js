import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMembersChunkEvent extends Event {
  static get type() {
    return 'guildMembersChunk';
  }
}

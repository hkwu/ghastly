import Event from './Event';

/**
 * @extends Event
 */
export default class GuildMemberSpeakingEvent extends Event {
  static get type() {
    return 'guildMemberSpeaking';
  }
}

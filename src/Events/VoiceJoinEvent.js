import Event from './Event';

export default class VoiceJoinEvent extends Event {
  static get type() {
    return 'voiceJoin';
  }
}

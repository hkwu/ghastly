import Event from './Event';

class VoiceJoinEvent extends Event {
  static get type() {
    return 'voiceJoin';
  }
}

export default VoiceJoinEvent;

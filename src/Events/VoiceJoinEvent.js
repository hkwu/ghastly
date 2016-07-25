import Event from './Event.js';

class VoiceJoinEvent extends Event {
  constructor() {
    super('voiceJoin');
  }
}

export default VoiceJoinEvent;

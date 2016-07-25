import Event from './Event.js';

class VoiceStateUpdateEvent extends Event {
  constructor() {
    super('voiceStateUpdate');
  }
}

export default VoiceStateUpdateEvent;

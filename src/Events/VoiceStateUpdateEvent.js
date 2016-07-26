import Event from './Event';

class VoiceStateUpdateEvent extends Event {
  static get type() {
    return 'voiceStateUpdate';
  }
}

export default VoiceStateUpdateEvent;

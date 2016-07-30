import Event from './Event';

export default class VoiceStateUpdateEvent extends Event {
  static get type() {
    return 'voiceStateUpdate';
  }
}

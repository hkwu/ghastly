import Event from './Event';

/**
 * @extends Event
 */
export default class VoiceStateUpdateEvent extends Event {
  static get type() {
    return 'voiceStateUpdate';
  }
}

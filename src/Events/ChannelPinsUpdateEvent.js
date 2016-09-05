import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelPinsUpdateEvent extends Event {
  static get type() {
    return 'channelPinsUpdate';
  }
}

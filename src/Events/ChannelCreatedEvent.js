import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelCreatedEvent extends Event {
  static get type() {
    return 'channelCreated';
  }
}

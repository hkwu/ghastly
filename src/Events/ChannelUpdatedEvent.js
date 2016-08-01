import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelUpdatedEvent extends Event {
  static get type() {
    return 'channelUpdated';
  }
}

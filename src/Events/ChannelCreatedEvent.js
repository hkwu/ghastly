import Event from './Event';

export default class ChannelCreatedEvent extends Event {
  static get type() {
    return 'channelCreated';
  }
}

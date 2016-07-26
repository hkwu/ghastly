import Event from './Event';

class ChannelCreatedEvent extends Event {
  static get type() {
    return 'channelCreated';
  }
}

export default ChannelCreatedEvent;

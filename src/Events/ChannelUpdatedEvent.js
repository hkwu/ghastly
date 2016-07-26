import Event from './Event';

class ChannelUpdatedEvent extends Event {
  static get type() {
    return 'channelUpdated';
  }
}

export default ChannelUpdatedEvent;

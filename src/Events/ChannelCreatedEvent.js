import Event from './Event.js';

class ChannelCreatedEvent extends Event {
  constructor() {
    super('channelCreated');
  }
}

export default ChannelCreatedEvent;

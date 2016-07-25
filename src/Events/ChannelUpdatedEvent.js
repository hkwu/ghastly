import Event from './Event.js';

class ChannelUpdatedEvent extends Event {
  constructor() {
    super('channelUpdated');
  }
}

export default ChannelUpdatedEvent;

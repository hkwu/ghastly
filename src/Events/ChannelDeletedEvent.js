import Event from "./Event.js";

class ChannelDeletedEvent extends Event {
    constructor() {
        super("channelDeleted");
	}
}

export default ChannelDeletedEvent;

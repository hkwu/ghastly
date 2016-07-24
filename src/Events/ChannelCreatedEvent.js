import Event from "./Event.js";

class ChannelCreatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "channelCreated";
    }
}

export default ChannelCreatedEvent;

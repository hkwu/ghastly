import Event from "./Event.js";

class ChannelUpdatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "channelUpdated";
    }
}

export default ChannelUpdatedEvent;

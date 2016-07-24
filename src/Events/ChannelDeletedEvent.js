import Event from "./Event.js";

class ChannelDeletedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "channelDeleted";
    }
}

export default ChannelDeletedEvent;

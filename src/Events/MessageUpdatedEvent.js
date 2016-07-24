import Event from "./Event.js";

class MessageUpdatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "messageUpdated";
    }
}

export default MessageUpdatedEvent;

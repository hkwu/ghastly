import Event from "./Event.js";

class MessageDeletedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "messageDeleted";
    }
}

export default MessageDeletedEvent;

import Event from "./Event.js";

class MessageEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "message";
    }
}

export default MessageEvent;

import Event from "./Event.js";

class DisconnectedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "disconnected";
    }
}

export default DisconnectedEvent;

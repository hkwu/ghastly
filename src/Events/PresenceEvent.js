import Event from "./Event.js";

class PresenceEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "presence";
    }
}

export default PresenceEvent;

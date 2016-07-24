import Event from "./Event.js";

class RawEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "raw";
    }
}

export default RawEvent;

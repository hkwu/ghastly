import Event from "./Event.js";

class DebugEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "debug";
    }
}

export default DebugEvent;

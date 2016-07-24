import Event from "./Event.js";

class ReadyEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "ready";
    }
}

export default ReadyEvent;

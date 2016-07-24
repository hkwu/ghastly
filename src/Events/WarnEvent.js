import Event from "./Event.js";

class WarnEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "warn";
    }
}

export default WarnEvent;

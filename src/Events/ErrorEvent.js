import Event from "./Event.js";

class ErrorEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "error";
    }
}

export default ErrorEvent;

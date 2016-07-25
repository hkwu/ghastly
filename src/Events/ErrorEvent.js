import Event from "./Event.js";

class ErrorEvent extends Event {
    constructor() {
        super("error");
	}
}

export default ErrorEvent;

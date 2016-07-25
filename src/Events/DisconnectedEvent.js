import Event from "./Event.js";

class DisconnectedEvent extends Event {
    constructor() {
        super("disconnected");
	}
}

export default DisconnectedEvent;

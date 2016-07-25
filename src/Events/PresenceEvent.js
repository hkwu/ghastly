import Event from "./Event.js";

class PresenceEvent extends Event {
    constructor() {
        super("presence");
	}
}

export default PresenceEvent;

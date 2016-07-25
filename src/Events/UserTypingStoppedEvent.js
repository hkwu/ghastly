import Event from "./Event.js";

class UserTypingStoppedEvent extends Event {
    constructor() {
        super("userTypingStopped");
	}
}

export default UserTypingStoppedEvent;

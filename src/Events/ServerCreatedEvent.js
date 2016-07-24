import Event from "./Event.js";

class ServerCreatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverCreated";
    }
}

export default ServerCreatedEvent;

import Event from "./Event.js";

class ServerUpdatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverUpdated";
    }
}

export default ServerUpdatedEvent;

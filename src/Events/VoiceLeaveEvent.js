import Event from "./Event.js";

class VoiceLeaveEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "voiceLeave";
    }
}

export default VoiceLeaveEvent;

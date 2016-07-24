import Event from "./Event.js";

class VoiceJoinEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "voiceJoin";
    }
}

export default VoiceJoinEvent;

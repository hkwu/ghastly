import Event from "./Event.js";

class VoiceStateUpdateEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "voiceStateUpdate";
    }
}

export default VoiceStateUpdateEvent;

import Discord from "discord.js";

class Client extends Discord.Client {
    constructor(options = {}) {
        super(options);
    }

    registerEvents(events) {
        if (events.constructor === Array) {
            for (const event of events) {
                this._registerEvent(event);
            }
        } else {
            this._registerEvent(events);
        }
    }

    _registerEvent(event) {
        let eventInstance = new event();
        eventInstance.client = this;
        this.on(eventInstance.type, eventInstance.actionWrapper.bind(eventInstance));
    }
}

export default Client;

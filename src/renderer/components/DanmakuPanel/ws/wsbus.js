import { wsPromise, wsStatus } from "./websocket.js";
import { Event } from "./utils.js";

class WsEvent extends Event {
	registered = false;
	id = "";
	constructor() {
		super();
		this.id = "";
	}

	register(id) {
		if (!this.checkRegister()) {
			return wsPromise("register", {
				type: 3,
				data: {
					clientID: id
				}
			}).then(() => {
				wsStatus.ws.addEventListener("message", (e) => {
					const data = JSON.parse(e.data);
					if (data.type === 5) {
						try {
							if (data.error) {
								throw new Error(data.error);
							}

							const realData = JSON.parse(data.data.message);
							if (realData.sourceID !== this.id) {
								this.emit(realData.event, realData.data);
							}
						} catch (error) {
							console.error(error);
						}
					}
				});
				wsStatus.ws.addEventListener("close", (e) => {
					this.registered = false;
				});
				this.registered = true;
				this.id = id;
				this.emit("registered");
			});
		}
		this.emit("registered");
		return Promise.resolve();
	}

	reRegister() {
		if (this.id) {
			return this.register(this.id);
		} else {
			console.log("not registered yet!");
			return false;
		}
	}

	checkRegister() {
		if (!this.registered) console.log("unregistered yet!");
		return this.registered;
	}

	wsEmit(eventName, data = {}, targetID = "") {
		const promise = () => {
			return wsPromise("message-broadcast", {
				type: 4,
				data: {
					clientID: targetID,
					message: JSON.stringify({
						sourceID: this.id,
						event: eventName,
						data
					})
				}
			});
		};
		if (this.checkRegister()) {
			return promise();
		}
		//  else {
		// 	this.once("registered", promise);
		// 	return true;
		// }
	}
}

export const wsevent = new WsEvent();

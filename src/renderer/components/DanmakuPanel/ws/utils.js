export const randomId = (length = 6) => {
	let Num = "";
	for (let i = 0; i < length; i++) {
		Num += Math.floor(Math.random() * 10);
	}
	return Num;
};


export class Event {
	events = {};
	constructor() {
		this.events = {};
	}

	getEventList(eventName) {
		if (!this.events[eventName]) this.setEventList(eventName);
		return this.events[eventName];
	}

	setEventList(eventName, list = []) {
		this.events[eventName] = list;
	}

	on(eventName, fn) {
		if (!fn instanceof Function) return;
		const list = this.getEventList(eventName);
		list.find(fn) ? false : this.events[eventName].push(fn);
	}

	once(eventName, fn) {
		if (!fn instanceof Function) return;
		const once = (e) => {
			this.off(eventName, once);
			fn(e);
		};
		this.on(eventName, once);
	}

	off(eventName, fn) {
		if (!fn instanceof Function) return;
		this.setEventList(eventName, this.getEventList(eventName).filter(f => f !== fn));
	}

	emit(eventName, data = {}) {
		this.getEventList(eventName).forEach(fn => fn(data));
	}
}

export const event = new Event();

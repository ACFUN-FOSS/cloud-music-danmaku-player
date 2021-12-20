import { wsStatus as status } from "./websocket.js";

let heartbeat = null;
let ready = 0;
let heartBeatCount = 0;
export const isOnline = () => {
	return window.wsl?.readyState === 1;
};
export const isConnecting = () => {
	return window.wsl?.readyState === 0;
};

export const heartBeat = () => {
	console.log("====心跳=====");
	const judge = (e) => {
		const data = JSON.parse(e.data);
		// console.log("心跳捕获", data);
		if (data.type === 1) {
			console.log("====心跳应答=====");
			window.wsl?.removeEventListener("message", judge);
			heartBeatCount--;
		}
	};
	window?.wsl.addEventListener("message", judge);
	const role = window.role || "无";
	status.ws.send(
		JSON.stringify({
			role,
			type: 1
		})
	);
	heartBeatCount++;

	if (heartBeatCount > 5) {
		try {
			window?.wsl?.close();
		} catch (error) {
			console.error(error);
		}
		heartBeatCount = 0;
	}
};
export const startHeatBeat = () => {
	clearTimeout(heartbeat);
	if (isOnline()) {
		heartBeat();
	}
	heartbeat = setTimeout(() => {
		startHeatBeat();
	}, 3000);
};
export const init = ({ onOpen, onClose }) => {
	startHeatBeat();
	if (!isOnline() && !isConnecting()) {
		try {
			window.wsl.close();
		} catch (error) {
			// console.error(error);
		}
		window.wsl = status.ws = new WebSocket(status.url);
		status.ws.onopen = () => {
			status.online = true;
			ready = 1;
			onOpen();
		};
		status.ws.onclose = () => {
			status.online = false;
			// @ts-ignore
			status.ws = window.wsl = null;
			if (ready) {
				ready = 0;
				onClose();
			}
		};
		status.ws.onerror = () => {
			status.online = false;

		};
		// status.ws.onmessage = (e: any) => {
		// 	// console.log(e.data);
		// };
	}
};

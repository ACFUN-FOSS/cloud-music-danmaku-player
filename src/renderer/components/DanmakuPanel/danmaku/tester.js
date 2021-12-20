import {
	getTime,
	getMedal,
	getAvatar,
	getNickName,
	getContent,
	getUserInfo,
	getGift
} from "./getter";
export const hasTime = (danmaku) => {
	return Boolean(getTime(danmaku));
};

export const hasMedal = (danmaku) => {
	return Boolean(getMedal(danmaku).clubName);
};

export const hasAvatar = (danmaku) => {
	return Boolean(getAvatar(danmaku));
};

export const hasNickName = (danmaku) => {
	return Boolean(getNickName(danmaku));
};

export const hasContent = (danmaku) => {
	return Boolean(getContent(danmaku));
};

export const hasGift = (danmaku) => {
	return danmaku.type === 1005;
};


export const isNormalDanmaku = (danmaku) => {
	return [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007].includes(
		danmaku.type
	);
};

export const sameGift = (danmakuA, danmakuB) => {
	return (
		getGift(danmakuA).giftDetail.giftID ===
		getGift(danmakuB).giftDetail.giftID
	);
};

export const samePerson = (danmakuA, danmakuB) => {
	return getUserInfo(danmakuA).userID === getUserInfo(danmakuB).userID;
};

export const basicComponentTester = {
	1000: [hasNickName, hasAvatar, hasMedal, hasContent, hasTime],
	1001: [hasNickName, hasAvatar, hasMedal, hasTime],
	1002: [hasNickName, hasAvatar, hasMedal, hasTime],
	1003: [hasNickName, hasAvatar, hasMedal, hasTime],
	1004: [hasNickName, hasTime],
	1005: [hasNickName, hasAvatar, hasMedal, hasTime],
	1006: [],
	1007: [hasNickName, hasTime]
};

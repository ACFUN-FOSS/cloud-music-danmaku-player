export const getDanmuInfo = (danmaku) => {
	const type = danmaku?.type;
	switch (type) {
		case 1000:
			return danmaku.data.danmuInfo;
		case 1001:
			return danmaku.data;
		case 1002:
			return danmaku.data;
		case 1003:
			return danmaku.data;
		case 1004:
			return danmaku.data;
		case 1005:
			return danmaku.data.danmuInfo;
		case 1006:
			return danmaku.data;
		case 1007:
			return danmaku.data;
		default:
			return 0;
	}
};

export const getUserInfo = (danmaku) => {
	const type = danmaku?.type;
	switch (type) {
		case 1007:
			return getDanmuInfo(danmaku).fansInfo;
		case 1006:
			return {};
		default:
			return getDanmuInfo(danmaku).userInfo;
	}
};

export const getTime = (danmaku) => {
	const type = danmaku?.type;
	switch (type) {
		case 1007:
			return danmaku?.data?.joinTime;
		default:
			return getDanmuInfo(danmaku)?.sendTime;
	}
};

export const setTime = (danmaku, time) => {
	const type = danmaku?.type;
	switch (type) {
		case 1007:
			danmaku.data.joinTime = time;
			break;
		default:
			getDanmuInfo(danmaku).sendTime = time;
	}
	return danmaku;
};

export const getMedal = (danmaku) => {
	return getUserInfo(danmaku).medal;
};

export const getMedalLevel = (danmaku) => {
	return getMedal(danmaku).level;
};

export const getMedalName = (danmaku) => {
	return getMedal(danmaku).clubName;
};

export const getAvatar = (danmaku) => {
	return getUserInfo(danmaku).avatar;
};

export const getNickName = (danmaku) => {
	return getUserInfo(danmaku).nickname;
};

export const getUID = (danmaku) => {
	return getUserInfo(danmaku).userID;
};

export const getContent = (danmaku) => {
	if (danmaku.type !== 1000) {
		return "";
	}
	return danmaku.data.content;
};

export const getGift = (danmaku) => {
	if (danmaku.type !== 1005) {
		return {
			display: false
		};
	}
	return {
		display: true,
		...danmaku.data
	};
};
export const getDanmakuType = (danmaku) => {
	return danmaku.type;
};

export const getGiftName = (danmaku) => {
	return getGift(danmaku)?.giftDetail.giftName;
};

export const getGiftCombo = (danmaku) => {
	return getGift(danmaku)?.combo;
};

export const getGiftNumber = (danmaku) => {
	return getGift(danmaku)?.count;
};

export const setGiftNumber = (danmaku, number) => {
	danmaku.data.count = number;
};

export const getGiftValue = (danmaku) => {
	if (getGift(danmaku)?.giftDetail.payWalletType === 1) {
		return getGift(danmaku)?.value;
	}
	return 0;
};

export const getRichText = (danmaku) => {
	const content = [];
	danmaku.data.segments.forEach((i) => {
		switch (i.type) {
			case 1900:
				content.push(i.segment.userInfo.nickname);
				break;
			default:
				content.push(i.segment.text);
		}
	});
	return content.join(" ");
};

export const robotGetters = {
	getTime,
	getMedalLevel,
	getMedalName,
	getNickName,
	getContent,
	getGiftName,
	getGiftNumber,
	getGiftValue,
	getRichText
};

export const getterOptions = () => {
	return [
		{
			label: "时间",
			value: "getTime",
			avaliable: [1000, 1001, 1002, 1003, 1005, 1007]
		},
		{
			label: "牌子等级",
			value: "getMedalLevel",
			avaliable: [1000, 1001, 1002, 1003, 1005]
		},
		{
			label: "牌子名",
			value: "getMedalName",
			avaliable: [1000, 1001, 1002, 1003, 1005]
		},
		{
			label: "用户名",
			value: "getNickName",
			avaliable: [1000, 1001, 1002, 1003, 1005, 1007]
		},
		{
			label: "评论",
			value: "getContent",
			avaliable: [1000]
		},
		{
			label: "礼物名字",
			value: "getGiftName",
			avaliable: [1005]
		},
		{
			label: "礼物数量",
			value: "getGiftNumber",
			avaliable: [1005]
		},
		{
			label: "礼物价值",
			value: "getGiftValue",
			avaliable: [1005]
		},
		{
			label: "系统通知",
			value: "getRichText",
			avaliable: [1006]
		}
	];
};

<template>
	<a-form style="padding-top:16px" :form="settings" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
		<a-form-item label="连接状态">

			<a-button size="small" @click="unregisterEvents(true)"> <span :class="connected?'success':'fail'">
					{{connected?'工具箱已连接':'点击连接工具箱'}}</span></a-button>
			<br> 如果工具箱开启直播并且有弹幕后仍显示未连接，请点击以上按钮
		</a-form-item>
		<a-form-item label="老板充值记录">
			<br>老板送出指定礼物进行点歌券或切歌券的购买并在此累计
			<br>可设置点歌\切歌是否消耗点歌券或切歌券
		</a-form-item>
		<people-value-table :list="settings.peopleValueList" />
		<a-divider>点歌</a-divider>
		<a-form-item label="点歌指令">
			<a-input v-model="settings.keyword" @blur="settings.keyword?false:settings.keyword='点歌'" />
			<br>观众输入“{{settings.keyword}}@关键词”或者“{{settings.keyword}}@歌曲id” 进行点歌
			<br>不能有标点符号及空格
			<br>默认选择网易云搜索关键词的第一首,搜索不到不会消耗点歌券
			<br>如为灰色或账号无权限播放则会跳过
		</a-form-item>
		<a-form-item label="点歌冷却时间">
			<a-input-number v-model="settings.coolingTime" />
			<br>限制同一人频繁点歌，单位为分钟
		</a-form-item>
		<a-form-item label="点歌消耗点歌券">
			<a-switch v-model="settings.needGift" />
			<br>是否设置送礼才能点歌
		</a-form-item>
		<a-form-item label="点歌券礼物">
			<a-select v-model="settings.pickTicketName">
				<a-select-option v-for="{giftName} in pickTicketList" :key="giftName" :value="giftName">{{giftName}}
				</a-select-option>
			</a-select>
			<br>送出指定礼物会被识别成点歌券并记录
		</a-form-item>
		<a-form-item label="点歌人黑名单">
			<br>与工具箱共用同一黑名单，直接在工具箱拉黑即可
		</a-form-item>
		<a-form-item label="歌曲黑名单">
			<a-select mode="tags" style="width: 100%" v-model="settings.keywordBlackList" />
			<br>忽略包含这些名字的歌曲
		</a-form-item>
		<a-divider>切歌</a-divider>
		<a-form-item label="允许切歌">
			<a-switch v-model="settings.allowSwitch" />
			<br>为防止滥用，切歌必须消耗点歌券
		</a-form-item>
		<a-form-item label="切歌指令">
			<a-input v-model="settings.switchKeyword"
				@blur="settings.switchKeyword?false:settings.switchKeyword='切歌'" />
			<br>观众输入“@{{settings.switchKeyword}}@”进行切歌
			<br>会切到该观众点的未播放歌曲，如果找不到则切歌失败
			<br>切歌失败不会消耗点歌券
		</a-form-item>
		<a-form-item label="切歌冷却时间">
			<a-input-number v-model="settings.switchCooling" />
			<br>限制同一人频繁切歌，单位为分钟
		</a-form-item>
		<a-form-item label="切歌券礼物">
			<a-select v-model="settings.switchTicketName">
				<a-select-option v-for="{giftName} in switchTicketList" :key="giftName" :value="giftName">{{giftName}}
				</a-select-option>
			</a-select>
			<br>送出指定礼物会被识别成切歌券并记录
		</a-form-item>
		<a-divider>回复机器人</a-divider>
		<a-form-item label="点歌回复">
			<a-switch show-fallback fallback-input-type="color" v-model="settings.pickFeedback" />
			<br>弹幕回复观众点歌成功或失败
		</a-form-item>
		<a-form-item label="切歌回复">
			<a-switch show-fallback fallback-input-type="color" v-model="settings.switchFeedback" />
			<br>弹幕回复观众切歌成功或失败
		</a-form-item>
		<a-form-item label="储值查询">
			<a-switch show-fallback fallback-input-type="color" v-model="settings.checkFeedback" />
			<br>观众输入“@查询余额@” 进行点歌券和切歌券的查询
		</a-form-item>
		<a-form-item label="状态查询">
			<a-switch show-fallback fallback-input-type="color" v-model="settings.statusFeedback" />
			<br>观众输入“@我点的歌@” 查自己最早点的一首歌及其排位
		</a-form-item>
		<a-divider>OBS歌词选项</a-divider>
		<a-form-item label="歌名大小">
			<a-input-number v-model="settings.titleSize" />
		</a-form-item>
		<a-form-item label="歌名颜色">
			<v-swatches show-fallback fallback-input-type="color" v-model="settings.titleColor" />
		</a-form-item>
		<a-form-item label="歌名轮廓颜色">
			<v-swatches show-fallback fallback-input-type="color" v-model="settings.titleShadow" />
		</a-form-item>
		<a-form-item label="歌名轮廓大小">
			<a-input-number v-model="settings.titleOutline" />
		</a-form-item>
		<a-form-item label="歌词大小">
			<a-input-number v-model="settings.lyricSize" />
		</a-form-item>
		<a-form-item label="歌词颜色">
			<v-swatches show-fallback fallback-input-type="color" v-model="settings.lyricColor" />
		</a-form-item>
		<a-form-item label="歌词轮廓颜色">
			<v-swatches show-fallback fallback-input-type="color" v-model="settings.lyricShadow" />
		</a-form-item>
		<a-form-item label="歌词轮廓大小">
			<a-input-number v-model="settings.lyricOutline" />
		</a-form-item>
	</a-form>
</template>

<script>
import VSwatches from "vue-swatches";
import "vue-swatches/dist/vue-swatches.css";
import { init } from "./ws/server";
import { wsevent } from "./ws/wsbus";
import { hasContent, hasGift } from "./danmaku/tester";
import { getSearch } from "@/api/search";
import { normalSong } from "@/utils/song";
import {
	getGiftValue,
	getContent,
	getUserInfo,
	getUID,
	getGiftName,
	getGiftNumber
} from "./danmaku/getter";
import peopleValueTable from "./peopleValueTable.vue";
export default {
	name: "danmakuPanel",
	components: { VSwatches, peopleValueTable },
	data() {
		return {
			appID: "netease-music-player",
			lastSwitch: 0,
			pickCooling: [],
			giftList: [],
			connected: false,
			settings: {
				coolingTime: 1,
				allowSwitch: false,
				switchCooling: 3,
				needGift: false,
				pickTicketName: "香蕉",
				switchTicketName: "快乐水",
				lyricSize: 20,
				lyricColor: "rgba(250,250,250,1)",
				lyricShadow: "rgba(0,0,0,1)",
				lyricOutline: 0.8,
				titleSize: 16,
				titleColor: "rgba(250,250,250,1)",
				titleShadow: "rgba(0,0,0,1)",
				titleOutline: 0.8,
				switchKeyword: "切歌",
				keyword: "点歌",
				keywordBlackList: [],
				peopleValueList: [],
				pickFeedback: false,
				switchFeedback: false,
				checkFeedback: false,
				statusFeedback: false
			}
		};
	},
	computed: {
		switchTicketList() {
			return (
				this?.giftList?.filter(
					({ giftName }) =>
						giftName !== this?.settings?.pickTicketName
				) || []
			);
		},
		pickTicketList() {
			return (
				this?.giftList?.filter(
					({ giftName }) =>
						giftName !== this?.settings?.switchTicketName
				) || []
			);
		}
	},
	watch: {
		settings: {
			handler() {
				this.saveSettings();
			},
			deep: true
		}
	},
	mounted() {
		this.loadSettings();
		this.registerEvents();
	},
	beforeDestroy() {
		this.unregisterEvents();
	},
	methods: {
		connectServer() {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(reject, 5000);
				init({
					onOpen: () => {
						clearTimeout(timer);
						resolve();
					},
					onClose: () => {}
				});
			});
		},
		reconnect() {
			clearTimeout(this.rctimer);
			this.unregisterEvents();
			this.rctimer = setTimeout(this.registerEvents, 2000);
		},
		registerEvents() {
			this.connectServer()
				.then(() => {
					wsevent.on("server-response", this.handleDanmaku);
					wsevent.on("registered", this.requestData);
					wsevent.register(this.appID);
				})
				.catch(this.reconnect);
		},
		unregisterEvents(reconnected = false) {
			this.connected = false;
			if (reconnected) {
				window?.wsl?.close();
			}
			wsevent.off("server-response", this.handleDanmaku);
			wsevent.off("registered", this.requestData);
		},
		requestData() {
			wsevent.wsEmit(
				"register-client",
				{
					sourceID: this.appID,
					states: ["changedDanmaku"]
				},
				"server"
			);
			wsevent.once("acfun-api-res", (res) => {
				this.giftList = res;
			});
			wsevent.wsEmit(
				"acfun-api-get",
				{
					method: "getGift",
					sourceID: this.appID
				},
				"server"
			);
		},
		handleDanmaku(e) {
			this.connected = true;
			const { changedDanmaku } = e;
			if (!changedDanmaku?.length) return;
			changedDanmaku.forEach((danmaku) => {
				const uid = getUID(danmaku);
				if (hasGift(danmaku)) {
					this.addTicket(danmaku);
					return;
				}
				this.addSong(danmaku);
			});
		},
		clearPickCooling() {
			const { coolingTime } = this.settings;
			const lastLimit = Date.now() - 60 * 1000 * coolingTime;
			this.pickCooling = this.pickCooling.filter(
				(user) => user.timestamp < lastLimit
			);
		},
		checkSwitchCooling() {
			const { lastSwitch } = this;
			const { switchCooling } = this.settings;
			return lastSwitch < Date.now() - switchCooling * 60 * 1000;
		},
		addTicket(danmaku) {
			const giftName = getGiftName(danmaku);
			const { pickTicketName, switchTicketName } = this.settings;
			const idx = [pickTicketName, switchTicketName].indexOf(giftName);
			const user = this.getUserFromValueList(danmaku);
			if (!user) return;
			const num = getGiftNumber(danmaku);
			switch (idx) {
				case 0:
					user.pickTicket += num;
					break;
				case 1:
					user.switchTicket += num;
					break;
			}
			this.refreshValueList();
		},
		addSong(danmaku) {
			const content = getContent(danmaku);
			const type = this.checkPickOrSwitch(content);
			if (type === true) {
				this.switchSong(getUID(danmaku));
				return;
			}
			if (!type || !type.trim()) return;
			this.pickSong(type, danmaku);
		},
		checkPickOrSwitch(content) {
			const pickCommand = this?.settings?.keyword || "点歌";
			const switchCommand = this?.settings?.switchKeyword || "切歌";
			if (content.indexOf(`${pickCommand}@`) > -1) {
				return content.split(`${pickCommand}@`).pop();
			}
			if (content.indexOf(`${switchCommand}@`) > -1) {
				return true;
			}
			return false;
		},
		switchSong(UID) {},
		async pickSong(songName, danmaku) {
			const user = this.getUserFromValueList(danmaku);
			const isSU = this.isSU(getUID(danmaku));
			if (!isSU && user.pickTicket < 1) {
				return;
			}
			const { result } = await getSearch({ keyword: songName });
			const { songs } = result;
			if (!songs[0]) {
				this.pickFeedback(false, 0);
				return;
			}
			user.pickTicket--;
			this.refreshValueList();
			this.$store.commit("play/ADD_SONG", {
				...normalSong(songs[0]),
				danmaku: true
			});
			this.$store.commit("play/SET_PLAY_STATUS", true);
			this.pickReply(true, 0);
		},
		getUserFromValueList(danmaku) {
			const list = this?.settings?.peopleValueList;
			if (!list) return;
			let user = list.find(
				({ userInfo }) => userInfo.userID === getUID(danmaku)
			);
			if (user) {
				return user;
			}
			list.push({
				userInfo: getUserInfo(danmaku),
				switchTicket: 0,
				pickTicket: 0
			});
			return list[0];
		},
		refreshValueList() {
			const list = this?.settings?.peopleValueList;
			if (!list) return;
			this.settings.peopleValueList = [...list];
		},
		loadSettings() {
			const settings = localStorage.getItem("settings");
			try {
				this.settings = JSON.parse(settings);
			} catch (error) {}
		},
		saveSettings() {
			localStorage.setItem("settings", JSON.stringify(this.settings));
		},
		isSU(UID) {
			return [214844, 45443067, 103411].includes(UID);
		},
		pickReply(success, type) {
			if (!this?.settings?.pickFeedback) {
				return;
			}
			if (success) {
			} else {
				const msgList = ["未找到相关歌曲"];
			}
		},
		switchReply() {}
	}
};
</script>

<style scoped lang='scss'>
</style>

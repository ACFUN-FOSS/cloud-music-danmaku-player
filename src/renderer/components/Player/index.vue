<template>
	<transition name="player">
		<div class="player" ref="player" v-show="fullscreen">
			<section class="main">
				<a-icon type="shrink" class="shrink" @click="shrinkScreen" />
				<div class="main-top">
					<div class="left" v-if="Object.keys(current_song).length">
						<h4 class="name">
							<span>正在播放：{{ current_song.name }}</span>
							<router-link to="/" v-if="current_song.mv" class="label">mv</router-link>
						</h4>
						<div class="alia" v-if="current_song.alia && current_song.alia.length">
							<span v-for="(item, index) in current_song.alia" :key="index">{{ item.name }}</span>
						</div>
						<div class="info">
							<div class="album" :title="current_song.album.name" v-if="current_song.album">
								专辑：
								<router-link :to="`/album/${current_song.album.id}`" class="value">{{ current_song.album.name }}
								</router-link>
							</div>
							<div class="singer" v-if="current_song.artist">
								歌手：
								<artists :artists="current_song.artist" />
							</div>
						</div>
						<div class="lyric">
							<lyric-list class="default" ref="lyrics" />
						</div>
					</div>
					<div class="right">
						<div class="play-history-title" style="margin-bottom:16px">
							<a-radio-group v-model="playComponent" buttonStyle="solid">
								<a-radio-button :value="0">播放列表</a-radio-button>
								<a-radio-button :value="1">历史记录</a-radio-button>
							</a-radio-group>
						</div>
						<component :is="currentList"></component>
					</div>
				</div>
			</section>
			<div class="bg-player" :style="'backgroundImage: url(' + current_song.avatar + ')'" v-if="Object.keys(current_song).length"></div>
		</div>
	</transition>
</template>

<script>
import LyricList from "@/components/Lyric/index.vue";
import { mapState, mapGetters } from "vuex";
import Artists from "@/components/Common/artists";
import Comment from "@/components/Comment/index.vue";
import ZIcon from "@/components/ZIcon/index.vue";
import SongHeart from "@/components/Common/song-heart";
import CollectBtn from "./CollectBtn";
import { getSongComment } from "@/api/comment";
import { getSimiPlaylist, getSimiSong, getSongUsers } from "@/api/song";
import { normalSong } from "@/utils/song";
import CurrentPlayTable from "@/components/PlayBar/CurrentPlayTable";
import HistoryPlayTable from "@/components/PlayBar/HistoryPlayTable";
const LYRIC_LINE_HEIGHT = 34;

export default {
	name: "player",
	data() {
		return {
			isAddAnimation: false,
			comment: null,
			simiSongs: [],
			simiPlaylists: [],
			users: [],
			fixLyric: false,
			limit: 20,
			offset: 0,
			infiniteId: +new Date(),
			playComponent: 0,
			refresh: false,
			delay: 0,
			showTime: false,
			showFreq: false
		};
	},
	mounted() {
		if (this.current_song.avatar) {
			let img = new Image();
			img.src = this.current_song.avatar;
			console.log("this.current_song.avatar", this.current_song.avatar);
			img.onload = () => {
				this.isAddAnimation = true;
			};
		}
	},
	components: {
		Artists,
		Comment,
		ZIcon,
		SongHeart,
		CollectBtn,
		LyricList
	},
	computed: {
		...mapState("Download", ["downloaded", "downloading", "queue"]),
		...mapState("play", ["lyric"]),
		...mapGetters("play", [
			"fullscreen",
			"current_song",
			"playing",
			"source",
			"current_lyric_line"
		]),
		...mapGetters("User", ["likedsongIds", "createdList", "userId"]),
		isLiked() {
			return this.likedsongIds.includes(this.current_song.id);
		},
		lineCls() {
			return this.playing ? "track-line" : "track-line paused";
		},
		downloadstatus() {
			return [...this.downloaded, ...this.queue].findIndex(
				(item) => item.id === this.current_song.id
			) >= 0
				? { icon: "check-circle", text: "已下载", downloaded: true }
				: { icon: "download", text: "下载" };
		},
		currentList() {
			return [CurrentPlayTable, HistoryPlayTable][this.playComponent];
		}
	},
	watch: {
		fixLyric(newVal) {
			if (!newVal) {
				// 如果取消了固定歌词,自动滚到当前歌词行
				const lines = this.$refs.lyrics.$refs.lyricLine;
				let top = Number(
					lines[this.current_lyric_line].offsetTop -
						LYRIC_LINE_HEIGHT * 3
				);
				this.$refs.lyrics.scrollTo(top, "smooth");
			}
		},
		current_song(newSong, oldSong) {
			if (newSong.id === oldSong.id || !this.fullscreen) return;
			this.delay = 0;
			this.$refs.lyrics.scrollTo(0);
			this._getSimiPlaylist(newSong.id);
			this._getSimiSong(newSong.id);
			this._getSongUsers(newSong.id);

			this.offset = 0;
			this.comment = null;
			this.refresh = true;
			this.$nextTick(() => {
				this.refresh = false;
			});
		},
		fullscreen(newVal) {
			this.$nextTick(() => {
				if (newVal) {
					this.unWatcher_lyric = this.$watch(
						"current_lyric_line",
						(newLine) => {
							if (this.fixLyric) return;
							const lines = this.$refs.lyrics.$refs.lyricLine;
							if (lines && lines[newLine]) {
								let top =
									lines[newLine].offsetTop > 0
										? Number(
												lines[newLine].offsetTop -
													LYRIC_LINE_HEIGHT * 3
										  )
										: 0;
								this.$refs.lyrics.scrollTo(top, "smooth");
							}
						}
					);
					let img = new Image();
					img.src = this.current_song.avatar;
					img.onload = () => {
						this.isAddAnimation = true;
					};

					this.$nextTick(() => {
						this.scrollToCurrentLine();
					});

					if (this.current_song.folder) return;

					this.offset = 0;
					this.comment = null;
					this.refresh = true;
					this.$nextTick(() => {
						this.refresh = false;
					});
					this._getSimiPlaylist(this.current_song.id);
					this._getSimiSong(this.current_song.id);
					this._getSongUsers(this.current_song.id);
				} else {
					this.isAddAnimation = false;
					this.unWatcher_lyric && this.unWatcher_lyric();
				}
			});
		}
	},
	methods: {
		scrollToCurrentLine() {
			const lines = this.$refs.lyrics.$refs.lyricLine;
			if (lines && lines[this.current_lyric_line]) {
				let top = Number(
					lines[this.current_lyric_line].offsetTop -
						LYRIC_LINE_HEIGHT * 3
				);
				this.$refs.lyrics.scrollTo(top, "smooth");
			}
		},
		backward() {
			this.delay += 500;
			this.lyric.resetTime && this.lyric.resetTime(500);

			const currentTime = document.getElementById(this.source)
				.currentTime;
			this.lyric.seek(currentTime * 1000);
			if (!this.playing) {
				this.lyric.stop();
			}
		},
		forward() {
			this.delay -= 500;
			this.lyric.resetTime && this.lyric.resetTime(-500);

			const currentTime = document.getElementById(this.source)
				.currentTime;
			this.lyric.seek(currentTime * 1000);
			if (!this.playing) {
				this.lyric.stop();
			}
		},
		share() {
			let url = `https://music.163.com/#/song?id=${this.current_song.id}`;
			let _shareUrl =
				"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?";
			_shareUrl += "url=" + url;
			_shareUrl += "&showcount=" + 1; // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
			_shareUrl +=
				"&desc=" + "♪我发现一首不错的歌曲-" + this.current_song.name;
			_shareUrl += "&summary=" + "分享摘要";
			_shareUrl +=
				"&title=" + "♪我发现一首不错的歌曲-" + this.current_song.name;
			_shareUrl += "&site=" + "https://music.163.com/";
			_shareUrl += "&pics=" + this.current_song.avatar;
			this.$electron.remote.shell.openExternal(_shareUrl);
		},
		shrinkScreen() {
			this.$store.commit("play/SET_FULLSCREEN", false);
		},
		toggleFixLyric() {
			this.fixLyric = !this.fixLyric;
		},
		_getSimiSong(id) {
			if (this.current_song.folder) return;
			getSimiSong(id).then((res) => {
				this.simiSongs = res.songs.map((song) => {
					return normalSong(song);
				});
			});
		},
		_getSimiPlaylist(id) {
			if (this.current_song.folder) return;
			getSimiPlaylist(id).then((res) => {
				this.simiPlaylists = res.playlists;
			});
		},
		_getSongUsers(id) {
			if (!!this.current_song.folder || !this.userId) {
				return;
			}
			getSongUsers(id).then((res) => {
				this.users = res.userprofiles;
			});
		},
		async loadmore($state) {
			if (this.current_song.folder) return;
			let res = await getSongComment(
				this.current_song.id,
				this.limit,
				this.offset
			);
			if (res.comments.length) {
				if (this.comment) {
					this.comment.comments.push(...res.comments);
				} else {
					this.comment = res;
				}
			}
			if (res.more) {
				this.offset += this.limit;
				$state.loaded();
			} else {
				$state.complete();
			}
		},
		_handleLikeSong() {
			this.$store.dispatch("User/handleLikeSong", {
				songId: this.current_song.id,
				isLike: !this.isLiked
			});
		},
		download(song) {
			// if (this.downloaded.findIndex(item => item.id === this.current_song.id) >= 0) return
			this.$store.dispatch("Download/addDownloadQueue", [song]);
		},
		play(tracks, index) {
			this.$store.dispatch("play/appendPlay", tracks[index]);
		},
		goRoute(playlist) {
			this.shrinkScreen();
			this.$router.push({ path: `/playlist/${playlist.id}` });
		},
		goUserRoute(userId) {
			this.shrinkScreen();
			this.$router.push({ path: `/user?id=${userId}` });
		}
	}
};
</script>

<style lang="less" scoped>
@main-width: 1000px;
.play-history-title {
	display: flex;
	justify-content: center;
	/deep/ .ant-radio-button-wrapper {
		height: 28px;
		line-height: 26px;
	}
}
.player {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 50px;
	z-index: 999;
	background: #fff;
	overflow-y: auto;
	overflow-x: hidden;
	transform-origin: left bottom;
	&.player-enter-active,
	&.player-leave-active {
		transition: all 0.2s ease-out;
	}
	&.player-enter,
	&.player-leave-to {
		opacity: 0;
		transform: scale(0.16, 0.08);
	}

	.bg-player {
		position: absolute;
		left: 0;
		top: 0;
		overflow: hidden;
		width: 100%;
		height: 600px;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: 50%;
		filter: blur(50px);
		-webkit-filter: blur(50px);
		opacity: 0.6;
		background-image: linear-gradient(to top, #000, #fff);
		mask-image: linear-gradient(
			to bottom,
			#fff 0,
			#fff 15%,
			#fff 25%,
			rgba(255, 255, 255, 0.25) 75%,
			rgba(255, 255, 255, 0.1) 90%,
			rgba(255, 255, 255, 0) 100%
		);
		-webkit-mask-image: linear-gradient(
			to bottom,
			#fff 0,
			#fff 15%,
			#fff 25%,
			rgba(255, 255, 255, 0.25) 75%,
			rgba(255, 255, 255, 0.1) 90%,
			rgba(255, 255, 255, 0) 100%
		);
	}
	.main {
		position: relative;
		z-index: 2;
		max-width: @main-width;
		margin: auto;
		// padding-bottom: 50px;
		background: transparent;
		height: 100%;
		.shrink {
			position: fixed;
			left: 50%;
			top: 50px;
			z-index: 222;
			padding: 4px;
			background: rgba(255, 255, 255, 0.3);
			border-radius: 4px;
			color: rgba(0, 0, 0, 0.5);
			font-size: 22px;
			cursor: pointer;
			margin-left: 465px;
			border: 1px solid rgba(0, 0, 0, 0.05);
		}
		.main-top {
			display: flex;
			height: 100%;
			position: relative;
			.left {
				width: 400px;
				flex-shrink: 0;
				flex-grow: 0;
				height: 100%;
				position: relative;
				padding: 20px 40px 20px 20px;
				.name {
					font-size: 20px;
					display: flex;
					align-items: center;
					.label {
						padding: 1px 4px;
						border: 1px solid @primary-color;
						border-radius: 3px;
						font-size: 12px;
						color: @primary-color;
						margin-left: 4px;
					}
				}
				.info {
					height: 35px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					.album,
					.singer {
						flex: 1;
						padding-right: 15px;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}
				}
				.lyric {
					position: relative;
					border-right: 1px solid rgba(0, 0, 0, 0.05);
					height: calc(100% - 55px);
					margin-right: 30px;
					.lyric-control {
						position: absolute;
						right: -35px;
						top: 0;
						color: rgba(255, 255, 255, 0.5);
						.backward,
						.forward {
							background: rgba(0, 0, 0, 0.2);
							transform: rotate(90deg);
							border-radius: 50%;
							width: 18px;
							height: 18px;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-bottom: 5px;
							font-size: 10px;
							cursor: pointer;
						}
					}
					.pushpin {
						position: absolute;
						right: -35px;
						bottom: 0;
						border-radius: 50%;
						line-height: 1;
						padding: 5px;
						font-size: 16px;
						background: rgba(0, 0, 0, 0.2);
						color: rgba(255, 255, 255, 0.7);
						cursor: pointer;
						&.active {
							background: #fff;
							color: #333;
							border: 1px solid #eee;
						}
					}
				}
				.lyric-list {
					display: inline-block;
					vertical-align: top;
					width: 100%;
					height: calc(100% - 50px);
					overflow: auto;
					zoom: 120%;
					-webkit-mask-image: linear-gradient(
						to bottom,
						rgba(255, 255, 255, 0) 0,
						rgba(255, 255, 255, 0.6) 15%,
						rgba(255, 255, 255, 1) 25%,
						rgba(255, 255, 255, 1) 75%,
						rgba(255, 255, 255, 0.6) 85%,
						rgba(255, 255, 255, 0) 100%
					);
					.lyric-wrapper {
						overflow: auto;
						.text {
							margin: 0;
							padding: 4px 0;
							line-height: 26px;
							color: #333;
							font-size: 13px;
							transition: all 0.3s;
							&:first-child {
								margin-top: 30px;
							}
							&:last-child {
								padding-bottom: 100px;
							}
							&.current {
								color: @primary-color;
								font-size: 15px;
								text-shadow: 1px 1px rgba(0, 0, 0, 0.2),
									1px 2px rgba(0, 0, 0, 0.1);
							}
						}
					}
				}

				.value {
					color: #215eb9;
				}
			}
			.right {
				padding: 40px 40px 20px 20px;
				height: 100%;
				position: relative;
				/deep/ .play-table {
					height: calc(100% - 50px);
					overflow: auto;
					width: 550px;
				}
			}
		}
	}
}
</style>

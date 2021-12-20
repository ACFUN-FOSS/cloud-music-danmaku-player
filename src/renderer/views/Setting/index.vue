<template>
	<div class="setting">
		<setting-download-folder />
		<setting-version />
	</div>
</template>

<script>
import SettingDownloadFolder from "./components/SettingDownloadFolder"; export
default { name: "setting", data() { return {}; }, components: {
SettingDownloadFolder, }, };
</script>

<style lang="less" scoped></style>

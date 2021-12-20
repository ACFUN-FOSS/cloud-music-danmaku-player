<template>
	<ex-icon v-if="isExternal" :type="`icon-${type}`" />
	<my-icon v-else :type="`icon-${type}`" />
</template>

<script>
import { Icon } from "ant-design-vue";

// let iconURL = 'public/js/icon.js'
const iconURL = "https://at.alicdn.com/t/font_1188071_1m1k6mct6ob.js";
// console.log(iconURL)
const selfIcon = "//at.alicdn.com/t/font_2759463_0gh0s4lxuvrr.js";
let MyIcon = Icon.createFromIconfontCN({
	scriptUrl: iconURL
});
let ExIcon = Icon.createFromIconfontCN({
	scriptUrl: selfIcon
});
export default {
	components: {
		MyIcon,
		ExIcon
	},
	props: {
		type: {
			type: String,
			required: true
		},
		isExternal: {
			type: Boolean,
			default: false
		}
	}
};
</script>

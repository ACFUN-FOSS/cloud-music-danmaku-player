<template>
	<div style="margin-left:40px;width:calc(100% - 80px);position:relative;">
		<el-input placeholder="用户名过滤" size="mini" v-model="nameFilter" />
		<el-table :data="filteredList" border style="width: 100%" height="300px">
			<el-table-column label="uid" width="80">
				<template slot-scope="scope">
					<span style="margin-left: 10px">{{ scope.row.userInfo.userID }}</span>
				</template>
			</el-table-column>
			<el-table-column label="用户名">
				<template slot-scope="scope">
					<span style="margin-left: 10px">{{ scope.row.userInfo.nickname }}</span>
				</template>
			</el-table-column>
			<el-table-column label="点歌券" width="80">
				<template slot-scope="scope">
					<span style="margin-left: 10px">{{ scope.row.pickTicket }}</span>
				</template>
			</el-table-column>
			<el-table-column label="切歌券" width="80">
				<template slot-scope="scope">
					<span style="margin-left: 10px">{{ scope.row.switchTicket }}</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
export default {
	props: {
		list: {
			required: true
		}
	},
	computed: {
		filteredList() {
			if (!this.nameFilter) {
				return this.list;
			}
			return this.list.filter((i) =>
				i.userInfo.nickname.includes(this.nameFilter)
			);
		}
	},
	data() {
		return {
			nameFilter: ""
		};
	}
};
</script>

<style>
</style>
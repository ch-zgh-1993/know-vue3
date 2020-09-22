<!--
* @Author: Zhang Guohua
* @Date:   2020-09-18 15:53:16
* @Last Modified by:   zgh
* @Last Modified time: 2020-09-18 15:59:40
* @Description: create by zgh
* @GitHub: Savour Humor
-->
<template>
	<div class="wrapper">
		<h3 class="title">组件 setup</h3>
		<props
			:name="propsData.name"
		></props>

		<h3 class="title">响应式系统</h3>
		<reactive></reactive>
	</div>
</template>

<script type="text/javascript">
import { reactive } from '@vue/composition-api'

export default {
	components: {
		props: () => import('./modules/base/setup'),
		reactive: () => import('./modules/reactive')
	},
	setup () {
		// const time = new Date()
		
		// props 组件
		const propsData = reactive({
			name: 'i am props name'
		})
		
		return {
			propsData
		}
	}
}
</script>

<style type="text/css" scoped>
.wrapper {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.title {
	color: red;
	padding-bottom: 20px;
	border-bottom: 1px dashed #000;
}
</style>

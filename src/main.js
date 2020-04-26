/*
* @Author: Zhang Guohua
* @Date:   2020-04-23 17:26:34
* @Last Modified by:   zgh
* @Last Modified time: 2020-04-23 17:54:05
* @Description: create by zgh
* @GitHub: Savour Humor
*/
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
import App from './App.vue'
import router from './router'


Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App),
}).$mount('#app')

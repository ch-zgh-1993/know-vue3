/*
* @Author: Zhang Guohua
* @Date:   2020-04-23 17:36:56
* @Last Modified by:   zgh
* @Last Modified time: 2020-09-18 15:54:51
* @Description: create by zgh
* @GitHub: Savour Humor
*/
import Vue from 'vue'
import VueRouter from 'vue-router'

import HelloWorld from '../components/HelloWorld.vue'
import API from '../views/api/index.vue'

Vue.use(VueRouter)

const routes = [{
	path: '/',
	component: HelloWorld
}, {
	path: '/api',
	component: API
}]


export default new VueRouter({
	mode: 'history',
	routes
})
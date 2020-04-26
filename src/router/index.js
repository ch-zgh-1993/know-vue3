/*
* @Author: Zhang Guohua
* @Date:   2020-04-23 17:36:56
* @Last Modified by:   zgh
* @Last Modified time: 2020-04-23 17:52:11
* @Description: create by zgh
* @GitHub: Savour Humor
*/
import Vue from 'vue'
import VueRouter from 'vue-router'

import HelloWorld from '../components/HelloWorld.vue'

Vue.use(VueRouter)

const routes = [{
	path: '/',
	component: HelloWorld
}]


export default new VueRouter({
	mode: 'history',
	routes
})
import Vue from 'vue'
import weex from 'weex-vue-render'
/* eslint-disable no-undef */
weex.init(Vue)

/* weex initialized here, please do not move this line */
import App from '@/App.vue'
/* eslint-disable no-new */
new Vue(Vue.util.extend({el: '#root'}, App));

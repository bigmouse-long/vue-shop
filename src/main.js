import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
// 全局导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


//导入全局样式表
import './assets/css/global.css'
//全局导入富文本编辑器样式表
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
    // config是固定值，不能改变
    config.headers.Authorization = window.sessionStorage.getItem('key')
        // 一定要进行返回
    return config
})

Vue.prototype.$http = axios
    // 将富文本编辑器挂载到全局
Vue.use(VueQuillEditor)

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
    // 格式化事件的全局过滤器
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
    const year = dt.getFullYear()
    const month = (dt.getMonth() + 1 + '').padStart(2, '0')
    const day = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
})
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
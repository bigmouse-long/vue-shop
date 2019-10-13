import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import Home from './components/Home.vue'


Vue.use(Router)

const router = new Router({
        routes: [
            //重定向到登录页面
            { path: '/', redirect: '/login' },
            { path: '/login', component: Login },
            { path: '/home', component: Home }
        ]
    })
    //路由导航守卫，判断是否登录，如果没有登陆则没有访问其它页面权限
router.beforeEach((to, from, next) => {
    //to 要去往的路由配置
    //from 当前所处的路由配置
    //next 一定要调用，让to的路由配置继续生效，比如如果去登陆直接next(),否则判断token是否存在，如果存在就next()

    if (to.path === '/login') return next();
    //获得当前页面的token值
    const token = window.sessionStorage.getItem('key');
    //如果token值不存在 跳转到登录页面
    if (!token) return next('/login')
        //存在则继续访问其它页面
    next()

})
export default router
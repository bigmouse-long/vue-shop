import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cates from './components/goods/cate.vue'
import Params from './components/goods/params.vue'
import Goods from './components/goods/goods.vue'
import Add from './components/goods/add.vue'
Vue.use(Router)

const router = new Router({
        routes: [
            //重定向到登录页面
            { path: '/', redirect: '/login' },
            { path: '/login', component: Login },
            {
                path: '/home',
                component: Home,
                // 当访问home页面时，重定向到welcome
                redirect: '/welcome',
                children: [
                    { path: '/welcome', component: Welcome, redirect: '/users' },
                    // 用户列表组件
                    { path: '/users', component: Users },
                    // 权限列表组件
                    { path: '/rights', component: Rights },
                    // 角色列表权限
                    { path: '/roles', component: Roles },
                    { path: '/categories', component: Cates },
                    { path: '/params', component: Params },
                    { path: '/goods', component: Goods },
                    { path: '/goods/add', component: Add },



                ]
            }
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
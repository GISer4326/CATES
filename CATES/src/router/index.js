/*
 * @Author: your name
 * @Date: 2021-12-27 13:56:51
 * @LastEditTime: 2022-11-30 18:06:14
 * @LastEditors: BinjieYuan yuanbj9035@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \flaskVueSEIMS\client\src\router\index.js
 */
import Vue from 'vue'
import VueRouter from 'vue-router'

import NProgress from 'nprogress' 
import 'nprogress/nprogress.css'// nprogress样式文件

import Home from '../components/Home.vue'
// import SideBar from '../components/sidebar/sidebar.vue'
// import BaseMap from '../components/MapView.vue'
// import BasinShow from '../components/control/BasinShow.vue'
import Login from '../views/user/login.vue'
import Signup from '../views/user/signup.vue'
Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path: '/home',
    name:'Home',
    component:Home,
  },
  {
    path: '/login',
    name:'Login',
    component:Login,
  },
  {
    path: '/signup',
    name:'Signup',
    component:Signup,
  },
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 进度条设置
NProgress.configure({     
  easing: 'ease',  // 动画方式    
  speed: 500,  // 递增进度条的速度    
  showSpinner: false, // 是否显示加载ico    
  trickleSpeed: 200, // 自动递增间隔    
  minimum: 0.3 // 初始化时的最小百分比
})

router.beforeEach((to,from,next) => {
  //开启进度条
  NProgress.start();
  //除了login和register，其他的路由访问必须先登录
  let tokenIsExists = localStorage.getItem('mytoken') ? true : false //检查本地存储中是否有token
  if(to.path == '/login' || to.path == '/signup'){
    next()    //允许访问路由
  }else{
    if(tokenIsExists){
      next()  //已经登录并取得token，允许访问路由
    }else{
      next('/login')  //路由跳转到登录组件
    }
  }
})

//当路由跳转结束后
router.afterEach(() => {  
  // 关闭进度条
  NProgress.done()
})


const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}

export default router

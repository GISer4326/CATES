/*
 * @Author: your name
 * @Date: 2021-12-27 14:25:53
 * @LastEditTime: 2023-03-03 14:34:00
 * @LastEditors: BinjieYuan yuanbj9035@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \flaskVueSEIMS\client\src\network\request.js
 */
import axios from 'axios'
import router from '../router/index'
import store from "@/store/index";



axios.defaults.retry = 20;  // 重试次数
axios.defaults.retryDelay = 10000; // 重试间隙

// export function request(config, success, failure) {
//1.创建axios的实例
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 1000 * 60 * 60 * 24, //一天
})

//设置axios，配置请求拦截器
request.interceptors.request.use(
  config => {
    //当调用带鉴权的接口时，添加token头部标志
    if(localStorage.getItem('mytoken')){
      //在请求头部中加入token
      config.headers.Authorization = localStorage.getItem('mytoken')
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// 响应拦截器
request.interceptors.response.use(
  response => {
    if (localStorage.getItem('mytoken') == null) {
      localStorage.setItem('mytoken', response.headers.authorization)
    } else {
      // console.log(1111111111);
      // console.log(localStorage.getItem('mytoken'));
      // console.log(response.headers.authorization);
      // console.log(JSON.stringify(response.config.data));
      // 是否存在刷新Token情况；若Token刷新则更新保存的Token
      if (response.headers.authorization !== undefined) {
        localStorage.setItem('mytoken', response.headers.authorization) //浏览器缓存
        store.commit("SET_TOKEN_STATUS",response.headers.authorization) //vuex store存储
      }
    }
    return response;
  }, 
  error => {
    //当token过期时，获取错误信息，并清除本地存储的过期token
    //重新发送请求设置
    const config = error.config;
    if (!config || !config.retry) {
      console.log("config为空")
      return Promise.reject(error);
    }

   
    config.retry--; // 减少重试次数
    console.log("重新发送请求")
    // return request(config);
    

    // if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
    //   config.retry--; // 减少重试次数
    //   console.log("重新发送请求")
    //   return request(config);
    // }
    // return Promise.reject(error)
    

    // if(error.response.status == 401){
    //   localStorage.removeItem('mytoken')
    //   store.commit("SET_TOKEN_STATUS",'')
    //   //跳转到登录组件
    //   router.push('/login')   
    // }
    return Promise.reject(error);
  });

export {request}
// export function request(config){
//     // 创建axios实例
//     const instance = axios.create({
//       baseURL:process.env.VUE_APP_BASE_API,
//       timeout:100000
//     })
//     // 发送真正的网络请求
//     return instance(config)
//   }
  
//   export function request2(config){
//     // 创建axios实例
//     const instance = axios.create({
//       baseURL:process.env.VUE_APP_GISSERVER_API,
//       timeout:100000
//     })
//     // 发送真正的网络请求
//     return instance(config)
//   }
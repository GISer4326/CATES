<!--
 * @Author: your name
 * @Date: 2021-12-27 13:56:51
 * @LastEditTime: 2022-11-29 21:16:09
 * @LastEditors: BinjieYuan yuanbj9035@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \flaskVueSEIMS\client\src\App.vue
-->
<template>
  <div id="app">
      <!-- <Home></Home> -->
      <!-- <router-link to="/home">home</router-link>  -->
      <!-- <router-link to="/login">login</router-link> 
      <router-link to="/signup">Signup</router-link>  -->
      <router-view></router-view>
  </div>
</template>

<script>
  // import BaseLayer from './views/BaseLayer.vue'
  // import BasinShow from './views/BasinShow.vue'
  import Home from './components/Home.vue'

export default {
  name: 'App',
  components: {
    Home
  }
}
</script>
<style scoped>

</style>

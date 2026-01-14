import Vue from 'vue'
import Vuex from 'vuex'

import MapView from '../store/modules/MapViewState'
import ProjectManage from '../store/modules/ProjectManage'
import UserInfo from '../store/modules/UserInfo'
// import createPersistedState from "vuex-persistedstate"
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    MapView,
    ProjectManage,
    UserInfo,
    // CreateModel
  },
  // state: {
  // },
  // mutations: {
  // },
  // actions: {
  // },
  // modules: {
  // }
  // plugins: [createPersistedState({
  //   storage: window.sessionStorage,
  //   reducer(val) {
  //     return { // 只储存state中的
  //       MapView: val.storeMap,
        

  //     }
  //   }
  // })]
})

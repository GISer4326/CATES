const state = () =>  ({
  createModelShow: null,
})

const getters = {
  // projectName: state => state.createModelShow
}

const mutations = {
  SET_CREATEMODEL_STATUS(state, name) {
    state.createModelShow = name;
  },

}
const actions = {


}



export default {
    state,
    getters,
    actions,
    mutations,
//     plugins: [createPersistedState({
//         storage: window.sessionStorage,
//         reducer(val) {
//           return { // 只储存state中的
//             storeMap: val.storeMap,
            
//           }
//         }
//       })]
}
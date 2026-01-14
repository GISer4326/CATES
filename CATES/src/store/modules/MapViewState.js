import L from 'leaflet';
import createPersistedState from "vuex-persistedstate"

const state = () =>  ({
  storeMap: null,
  levelSelect:7,
  mapLayers: {
    basinLayer: null,
  },
  basinBoundLayer:null,//流域范围图层组
  basinOutletLayer:null,//流域出口单图层
  subBasinLayer:null,//子流域图层组
  streamLayer:null,//河网图层组
  HLULayer:null,//HLU图层组
  subBasinOutletLayer:null,//子流域出口图层组
})

const getters = {
  storeMap: state => state.storeMap,
  basinBoundLayer: state => state.basinBoundLayer,
  basinOutletLayer: state => state.basinOutletLayer,
  subBasinLayer: state => state.subBasinLayer,
  streamLayer: state => state.streamLayer,
  HLULayer: state => state.HLULayer,
  subBasinOutletLayer: state => state.subBasinOutletLayer,
}

const mutations = {
  SET_MAP_OBJECT(state, map) {
    state.storeMap = map;
  },
  SET_BASINBOUNDLAYER_OBJECT(state, basinBoundLayer) {
    state.basinBoundLayer = basinBoundLayer;
  },
  SET_BASINOUTLETLAYER_OBJECT(state, basinOutletLayer) {
    state.basinOutletLayer = basinOutletLayer;
  },
  SET_SUBBASINLAYER_OBJECT(state, subBasinLayer) {
    state.subBasinLayer = subBasinLayer;
  },
  SET_STREAMLAYER_OBJECT(state, streamLayer) {
    state.streamLayer = streamLayer;
  },
  SET_HLULAYER_OBJECT(state, HLULayer) {
    state.HLULayer = HLULayer;
  },
  SET_SUBBASINOUTLETLAYER_OBJECT(state, subBasinOutletLayer) {
    state.subBasinOutletLayer = subBasinOutletLayer;
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
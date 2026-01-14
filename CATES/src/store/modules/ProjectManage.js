
const state = () => ({
  projectName: null,
  soilMapList: [
    {
      value: 'ChinaSoilType1km',
      label: 'HWSD v2.0'
    },
    // {
    //   value: 'ChinaSoilType1km',
    //   label: '中国土壤类型图'
    // },
    //{
    //  value: 'soil-2',
    //  label: 'soil-2'
    //},
  ],
  landuseMapList: [
    //{
    //  value: 'ESA_CCI_300m',
    //  label: 'ESA-CCI-300m'
    //},
    //{
    //  value: 'GLC',
    //  label: 'GLC'
    //},
    {
      value: 'MODIS',
      label: 'MODIS-500m'
    }
  ],
  overlayRangeList: [
    {
      value: 'all',
      label: '全部类型'
    },
    {
      value: 'glacier',
      label: '冰川'
    },
    {
      value: 'exclusion_glacier',
      label: '除冰川'
    },

  ],
  DEMList: [
    {
      value: 'shujuji',
      label: 'MERIT_DEM'
    },
  ],
  rainDataList: [
    {
      value: 'CMFD-pcp',
      label: 'CMFD'
    },
    //{
    //  value: 'rain-2',
    //  label: 'rain-2'
    //},
  ],
  meteoDataList: [
    {
      value: 'CMFD-meteo',
      label: 'CMFD'
    },
    //{
    //  value: 'meteo-2',
    //  label: 'meteo-2'
    //},
  ],
  observedDataList: [

  ],
  rainfallList: [

  ],
  QList: [

  ],
  dateList: [

  ],
  DOCList: [

  ],
  POIList: [

  ],
  POISelect: "",
  AttributeSelect: "",
})

const getters = {
  projectName: state => state.projectName,
  soilMapList: state => state.soilMapList,
  landuseMapList: state => state.landuseMapList,
  overlayRangeList: state => state.overlayRangeList,
  DEMList: state => state.DEMList,
  meteoDataList: state => state.meteoDataList,
  rainDataList: state => state.rainDataList,
  observedDataList: state => state.observedDataList,
  rainfallList: state => state.rainfallList,
  QList: state => state.QList,
  dateList: state => state.dateList,
  DOCList: state => state.DOCList,
  POIList: state => state.POIList,
  POISelect: state => state.POISelect,
  AttributeSelect: state => state.AttributeSelect,
}

const mutations = {
  SET_PROJECT_NAME(state, name) {
    state.projectName = name;
  },
  SET_SOIL_MAPLIST(state, name) {
    state.soilMapList = name;
  },
  SET_LANDUSE_MAPLIST(state, name) {
    state.landuseMapList = name;
  },
  SET_OVERLAYRANGE_LIST(state, name) {
    state.overlayRangeList = name;
  },
  SET_DEM_LIST(state, name) {
    state.DEMList = name;
  },
  SET_METEODATA_LIST(state, name) {
    state.meteoDataList = name;
  },
  SET_RAINDATA_LIST(state, name) {
    state.rainDataList = name;
  },
  SET_OBSERVEDDATA_LIST(state, name) {
    state.observedDataList = name;
  },
  SET_RAINFALL_LIST(state, name) {
    state.rainfallList = name;
  },
  SET_Q_LIST(state, name) {
    state.QList = name;
  },
  SET_DATE_LIST(state, name) {
    state.dateList = name;
  },
  SET_DOC_LIST(state, name) {
    state.DOCList = name;
  },
  SET_POI_LIST(state, name) {
    state.POIList = name;
  },
  SET_POI_SELECT(state, name) {
    state.POISelect = name;
  },
  SET_ATTRIBUTE_SELECT(state, name) {
    state.AttributeSelect = name;
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
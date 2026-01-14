<template>
  <div>
    <transition name="fade">
      <Modal v-model="riverShowTemp" draggable scrollable footer-hide :mask="false" title="Extraction of river-watershed attributes" width="650px"
        @on-visible-change="modalVisible">
        <Steps :current="activeKey - 1" style="margin-left: 20px ;margin-right: 20px;width: 95%;">
          <Step title="Create project"></Step>
          <Step title="Select data"></Step>
          <Step title="Specify POI"></Step>
        </Steps>
        <!-- step1 -->
        <div v-show="activeKey == '1'" style="margin: 20px;margin-top: 20px;">
          <div class="selectFlex" style="height: 35px;margin-bottom: 20px;">
            <!-- 输入项目名称 -->
            <Form :model="formProjectItem" :label-width="120" :rules="ruleProject" ref="formProjectItem" inline>
              <FormItem label="project name" prop='projectName'>
                <Input v-model="formProjectItem.projectName" placeholder="Please enter the project name" clearable
                  style="width: 300px"></Input>
              </FormItem>
            </Form>
          </div>
          <div class="finishBtn" style="margin-top: 15px;">
            <!-- 创建项目 -->
            <Button v-if="createProjectStatus == 'modelSetting'" type="info" ghost
              @click="createProject">Create project</Button>
            <div v-else-if="createProjectStatus == 'modelRunning'" style="width:85%">
              <i-progress :percent="99.99" status="active" hide-info></i-progress>
              <span>Project creating......</span>
            </div>
            <div v-else-if="createProjectStatus == 'modelRunSuccessed'" style="width:100%">
              <p class="finishFont">Project created</p>
              <div class="finishBtn" style="margin-top: 10px;">
                <Button type="info" ghost @click="giveUpCurrentProject">Cancel</Button>
                <Button style="margin-left:20px" type="primary" @click="nextStep">Next step</Button>
              </div>
            </div>
          </div>
        </div>
        <!-- step2 -->
        <div v-show="activeKey == '2'" style="margin: 20px;margin-top: 10px;margin-bottom: 0px">
          <div style="margin-bottom: 5px;">Basic data:</div>
            <Table border ref="selection1" :columns="tablecolumns1" :data="tabledata1" height="88">
              <template #action="{ row, index }">
                <!-- http://172.21.97.208:8083/api -->
                <!-- http://localhost:8083 -->
                <!-- `${apiBaseUrl}/infboy/uploadTIF` -->
                <Upload action="`${apiBaseUrl}/infboy/uploadTIF`" :data="uploaddata" :show-upload-list="false" :on-success="()=> updatesuccess1(index)"
                  :before-upload="(file)=> beforeUpload1(file, index)">
                  <Button icon="ios-cloud-upload-outline">Upload</Button>
                </Upload>
              </template>
              <template #source="{ row, index }">
                <Select v-model="sourceSelectdata[tabledata1[index].Factor]" @on-change="(value)=> selectChange1(value, index)" transfer>
                    <Option v-for="item in sourcedata1[tabledata1[index].Factor]" :value="item" :key="item">{{ item }}</Option>
                </Select>
              </template>
            </Table>
            <div style="margin-bottom: 5px;margin-top: 5px;">Attribute data:</div>
            <Table border ref="selection" :columns="tablecolumns" :data="tabledata" height="280" @on-selection-change="handleSelect">
              <template #action="{ row, index }">
                <Upload action="`${apiBaseUrl}/infboy/uploadTIF`" :data="uploaddata" show-upload-list :on-success="()=> updatesuccess(index)"
                  :before-upload="(file)=> beforeUpload(file, index)">
                  <Button icon="ios-cloud-upload-outline">Upload</Button>
                </Upload>
              </template>
              <template #source="{ row, index }">
                <Select v-model="sourceSelectdata[tabledata[index].Factor]" @on-change="(value)=> selectChange(value, index)" transfer>
                    <Option v-for="item in sourcedata[tabledata[index].Factor]" :value="item" :key="item">{{ item }}</Option>
                </Select>
              </template>
            </Table>
            <!-- <div style="margin-top: 16px">
                <Button @click="handleSelectAll(true)">Set all selected</Button>
                <Button @click="handleSelectAll(false)">Cancel all selected</Button>
            </div> -->
            <div class="finishBtn" style="margin-left: 0px;margin-right: 0px;margin-top: 10px;">
              <Button style="" type="primary" @click="previousStep">Previous step</Button>
              <Button style="margin-left:20px" type="primary" @click="nextStep">Next step</Button>
            </div>
          </div>
          <!-- step3 -->
          <div v-show="activeKey == '3'" style="margin: 20px;margin-bottom: 0px;">
            <div style="margin: 10px;margin-left: 0px;">
              <Space>
                Define outlet by click on the map:
                  <i-switch v-model="selectPOISwitch" @on-change="switchChange" style="margin-left: 10px;">
                      <Icon slot="open" type="md-pin" size="14"></Icon>
                      <Icon slot="close" type="md-close" size="14"></Icon>
                  </i-switch>
              </Space>
            </div>
            <div style="margin-bottom: 5px;">
              <!-- <input style="margin-left:-20px;" type="file" ref="fileInput" @change="handleFileChange"> -->
              <!-- http://localhost:8083/infboy/upload -->
              <!-- http://172.21.97.208:8083/api/infboy/upload -->
              <Upload :action="apiBaseUrl + '/infboy/upload'" :data="uploaddata" :show-upload-list="false" :on-success="inidata"
                  :on-progress="onProgress" >Upload POI：
                  <Button icon="ios-cloud-upload-outline">Upload files</Button>
              </Upload>
            </div>

            <Checkbox v-model="clickEuRadius">Consider buffer zone(Euclidean distance)</Checkbox>
            <Checkbox v-model="clickFpRadius">Consider buffer zone(Flowpath distance)</Checkbox>
            <div v-show="clickEuRadius || clickFpRadius">
              Buffer radius (meters):
              <InputNumber :min="1" v-model="radius"/>
            </div>
              
            <Table border max-height="250" highlight-row :columns="POIcolumns" no-data-text="Nodata" :data="POIdata" :loading="tableLoading" style="margin-top: 10px;"
              ref="table1">
              <template #action3="{ row, index }">
                <Button type="primary" size="small" style="margin-right: 5px"
                    @click="locate(index)">View</Button>
                <Button type="error" size="small" @click="remove(index)">Delete</Button>
              </template>
            </Table>
            <div class="finishBtn" style="margin-left: 0px;margin-right: 0px;margin-top: 10px;">
              <Button type="primary" @click="previousStep" style="float: left;width: 40%;">Previous step</Button>

              <Button type="primary" @click="static"  style="float: right;width: 70px;margin-left: 175px;">Extract</Button>
              <Button type="primary" @click="viewTable" :disabled="!basinRespons" style="float: right;margin-left:5px;width: 100px;">View report</Button>
            </div>
          </div>
         
          <!-- 3、统计数据 -->
          <!-- <TabPane label="统计数据导出">
            <div>
              <Space>
                <InputNumber :min="1" v-model="radius" @on-change="radius_tableData_Change" />
                环境因子：
                <Select v-model="typeSelect" style="width:250px" @on-change="typeSelectChange">
                    <Option v-for="item in TypeList" :value="item" :key="item">{{ item }}</Option>
                </Select>
                POI点：
                <Select v-model="pointSelect" style="width:130px" @on-change="pointSelectChange">
                    <Option v-for="item in pointList" :value="item" :key="item">{{ item }}</Option>
                </Select>
              </Space>
              <div id="landuseChart" style="height: 300px;width: 500px;margin-top: 30px;"></div>
              <div style="margin-top: 10px;">
                  <Button type="primary" :disabled="disabled" :loading="loading" @click="download">下载统计数据</Button>
              </div>
            </div>
          </TabPane> -->
      </Modal>
    </transition>
    
    <transition name="fade">
      <Modal v-model="staticDataModal" draggable scrollable footer-hide :mask="false" title="Report" z-index="999" width="1300px">
        <Table :columns="columns" :data="data" border max-height="500" size="default" no-data-text="Nodata" ref="table" :loading="tableloading2" style="margin: 20px;"></Table>
        <Space class="ivu-mt" wrap>
          <Button type="primary" @click="exportData(1)" style="margin-left: 20px;"><Icon type="ios-download-outline"></Icon> Export table data</Button>
          <Button type="primary" @click="exportShpData()" style="margin-left: 60px;"><Icon type="ios-download-outline"></Icon> Export shp data</Button>
        </Space>
      </Modal>
    </transition>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { request } from "@/network/request";
import MyComponent from "@/components/MapView.vue"
import { eventBus } from "@/network/eventBus"; // 导入事件总线

// import GeoTIFF, { fromBlob } from "geotiff";

export default {
  name: 'CreateModel',
  components: {
    MyComponent,
  },
  props: {
    riverShow: {
      type: Boolean
    }
  },
  watch: {
    //监听POItable数据变化
    POIdata(newValue) {
      console.log('myData发生了改变', newValue);
      if (newValue.length == 0) this.disabled = true;
      else {
        if(this.typeSelect == "") {
            this.typeSelect = "Landuse";
            this.typeSelectChange()
        }
        else {this.typeSelectChange()}
      }
    },
    riverShow(newVal, oldVal) {
      this.riverShowTemp = newVal
    },
    immediate: true,
    projectNameState(newValue, oldValue) {
        // 当store中的状态变化时，你可以根据需要进行相应的处理
        this.projectName = newValue;
        this.username=sessionStorage.getItem('username');
        console.log(this.projectName)
        console.log(this.username)
        this.uploaddata['projectName'] = this.projectName
        this.uploaddata['username'] = this.username 
        // this.uploaddata['tiftype'] = this.typeSelect
    },
  },
  mounted() {
    this.mapCM = this.$store.getters.storeMap;
    // this.init()
    this.initController();
    this.listenDraw();
    // this.initChart();
    this.POILayers = L.layerGroup([]);
    this.mapCM.addLayer(this.POILayers);

    const columns = [
        {
          title: 'ID',
          key: 'ID',
          align: 'center',
          width: 50,
          fixed: 'left',
          sortable: true
        },
        {
          title: 'Topographical',
          align: 'center',
          children: this.Topographical
        },
        
        // {
        //   title: 'Landuse',
        //   align: 'center',
        //   children: this.Landuse
        // },
        // {
        //   title: 'SoilType',
        //   align: 'center',
        //   children: this.SoilType
        // },
    ];
    this.columns = columns

    this.variables['Landuse'] = this.Landuse
    this.variables['Soiltype'] = this.Soiltype
    this.variables['Topographical'] = this.Topographical
    this.variables['Geological'] = this.Geological
    this.variables['Climate'] = this.Climate
    this.variables['Permafrost'] = this.Permafrost
    this.variables['Glacier'] = this.Glacier
    this.variables['NDVI'] = this.NDVI
    this.variables['LAI'] = this.LAI
    this.variables['EVI'] = this.EVI
    this.variables['ET'] = this.ET
    this.variables['NPP'] = this.NPP
    this.variables['Porosity'] = this.Porosity
    this.variables['Subsurface Permeability'] = this.Subsurface_Permeability
    this.variables['Population Count'] = this.Population_Count
    this.variables['Population Density'] = this.Population_Density
    this.variables['GPP'] = this.GPP
    this.variables['Soil Properties'] = this.Soil_Properties

    this.variables['Road Density'] = this.Road_Density
    this.variables['Nighttime Lights 2013'] = this.Stable_Lights
    this.variables['Human Footprint 2009'] = this.Human_Footprint
    this.variables['Total GDP 2015'] = this.Total_GDP
    this.variables['Per Capita GDP 2015'] = this.Per_Capita_GDP
    this.variables['HDI 2009'] = this.HDI
    


    // const data = [];
    // const d=
    // {
    //   "key": 1,
    //   "ID": 1,
    //   "Elevation_max": "678.7",
    //   "Elevation_min": "5.4",
    //   "Elevation_mean": "260.3909025",
    //   "Evergreen Broadleaf Forests": "18.13314711",
    //   "Woody Savannas": "18.00512104",
    //   "Savannas": "28.85242086",
    //   "Grasslands": "6.645716946",
    //   "Permanent Wetlands": "4.131750466",
    //   "Croplands": "0.046554935",
    //   "Urban and Built-up Lands": "1.44320298",
    //   "Cropland/Natural Vegetation Mosaics": "10.18389199",
    //   "Water Bodies": "12.55819367"
    // }
    // data.push(d)
    // this.data = data
    
    this.complte_TypeList = this.TypeList.map(() => 0);
      
  },
  computed: {
    // 使用计算属性将store中的状态绑定到组件的数据属性
    projectNameState() {
        return this.formProjectItem.projectName;
    },
    
  },
  data() {
    const validateProjectName = (rule, value, callback) => {
      if (value) {
        if (!value.match(/^[\u4E00-\u9FA5A-Za-z0-9_]+?$/)) {
          callback(new Error('不可输入特殊字符'))
        } else if (value.length > 16) {
          callback(new Error('项目名称字符应少于16位'))
        } else {
          callback()
        }
      }
    };
    const validateStreamValueCell = (rule, value, callback) => {
      if (!value.match(/^\+?[1-9][0-9]*$/)) {
        callback(new Error('应输入非零正整数'))
      } else {
        callback()
      }
    };
    const validateStreamValueArea = (rule, value, callback) => {
      // if (!value.match(/^[0-9]+(\.[0-9]{1,6})?$/)) {
      if (!value.match(/^(([1-9]\d{0,6})|0)(\.\d{0,5})?$/)) {
        callback(new Error('阈值应大于零,且有最多5位小数'))
      } else {
        callback()
      }
    };
    return {

      apiBaseUrl: process.env.VUE_APP_API_BASE_URL, // 动态读取环境变量

      clickEuRadius: false,
      clickFpRadius: false,
      tableloading2: false,
      polldataState: false,
      activeKey:1,
      variables:{
        // 'Landuse': this.Landuse,
        // 'SoilType': this.SoilType,
        // 'Elevation': this.Topographical
      },

      columns: [],
      data: [],

      complte_TypeList: [],
      complte_watershedList:[],
      data_f: [],

      basinRespons: false,
      complteAttributes: false,
      
      selectedFile: null,
      streamValue: 30,
      selectSubOutletsSwitch: false,
      subBasinOutletColumns: [
        {
          type: 'index',
          width: 45,
          height: 10,
          align: 'center'
        },
        {
          title: 'Lon',
          key: 'lon',
          height: 20,
        },
        {
          title: 'Lat',
          key: 'lat',
          height: 20,
        },
        {
          title: 'Action',
          slot: 'action',
          width: 100,
          align: 'center',
          height: 20,
        }
      ],
      riverShowTemp: false,
      formProjectItem: {
        projectName: 'test1_river',
        // projectName:'',
      },
      namedProjectBtnStatus: false,
      ruleProject: {
        projectName: [
          { required: true, message: '项目名称不能为空', trigger: 'change' },
          { type: 'string', validator: validateProjectName, trigger: 'change' }
        ]
      },
      createProjectStatus: 'modelSetting',
      isProjectNameVaild: false,
      ///////
      mapCM: null,
      drawingLayerGroup: null,//绘画图层组
      drawingBasinLayerGroup: null,//流域图层组
      drawingSubBasinLayerGroup: null,//子流域图层组
      streamLayerGroup: null,//河网图层组
      HLULayerGroup: null,//HLU图层组
      HLUlayer: null,

      subBasinOutletLayerStatus: false,

      basinScopeType: 'basinScopeFromSystem',
      basinCkb: false,
      levelSelect: 7,
      runSubBasinLoading: false,
      HLUDivisionLoading: false,
      levelLayerList: [],
      basinLayer: null,
      querySwitch: false,
      basinScopeSelectSystem: false,
      completeBasinScopeSelection: false,
      completeRunSubBasin: false,
      completeHLUDivision: false,
      basinScopeSelectLoadingStatus: false,
      completeStreamNetValueCommit: false,
      StreamNetValueCommitLoading: false,
      spinShow: false,
      DEMDataSize: 90,
      formStreamNetworkValue: {
        streamValueArea: '1.62',
        streamValueCell: '200',
      },
      HANDNum: 5,
      subareaType: null,
      selectLake: false,
      ruleStreamNetwork: {
        streamValueCell: [
          { required: true, message: '河网阈值不能为空', trigger: 'blur' },
          // {type:'number',pattern:/^\+?[1-9][0-9]*$/,message:'应输入非零正整数', trigger: 'blur',} //transform(value) {return Number(value);}
          { type: 'number', validator: validateStreamValueCell, trigger: 'blur', }
        ],
        streamValueArea: [
          { required: true, message: '河网阈值不能为空', trigger: 'blur' },
          // {type:'number', pattern:/^[0-9]+(\.[0-9]{1,3})?$/,message:'阈值应大于零', trigger: 'blur' }
          { type: 'number', validator: validateStreamValueArea, trigger: 'blur', }
        ]
      },
      outletType: 'outletFromSystemMapDraw',
      outletDrawSwitch: false,
      outletGeoJson: null,
      outletlon: null,
      outletlat: null,
      uploadList: [],
      outletMaxLength: 4,
      uploadMaxLength: 1,
      loadingStatus: false,
      outletOnMap: false,
      basinOutletSelectLoadingStatus: false,
      subbasinDelineationStatus: 'modelSetting',
      upstreamByClickSwitch: false,
      ucpLayer: null,//临时标记选取的上游流域范围点的图层。ucp:upstream-click-point
      subBasinOutletLayerGroup: null,//子流域出口图层组

      isSoilMapSelect: true,
      isLanduseMapSelect: true,
      isSlopeSelect: true,
      soilMapSelect: 'ChinaSoilType1km',
      soilMapDataType: 'soilMapFromSystem',
      soilParaSelect: '',
      landuseMapList: this.$store.getters.landuseMapList,
      overlayRangeList: this.$store.getters.overlayRangeList,
      landuseMapSelect: 'MODIS',
      soilOverlayRangeSelect: 'all',
      landuseOverlayRangeSelect: 'all',
      slopeOverlayRangeSelect: 'all',
      landuseDataType: 'landuseFromSystem',
      simulationUnitDelineationStatus: 'modelSetting',


      climatePreprocessStatus: 'modelSetting',
      climateOptions: {
        //设置可选的时间范围。在CMFD数据集的时间范围
        disabledDate(date) {
          let CMFDData = new Date('2018-12-30 10:30:00').getTime()
          let timeDiff = Date.now() - CMFDData
          return date && date.valueOf() > Date.now() - timeDiff;
        }
      },

      obsDataTypeSelect: [],
      obsDataTypeSelectSystem: [],
      obsDataTypeLocal: {
        name: '',
      },
      obsDataResource: [],
      obsFromSystem: 'obsFromSystem',
      obsFromLocal: 'obsFromLocal',
      observedUploadList: [],
      observedLoadingStatus: false,
      downloadObserverdExampleLoadingStatus: false,
      observedPreprocessStatus: 'modelSetting',
      // 
      preprocessToMongoDB: false,
      basinScopeTypeDes: '',
      outletTypeDes: '',
      soilMapDataTypeDes: '',
      soilParaDataTypeDes: '',
      landuseDataTypeDes: '',
      rainDataTypeDes: '',
      meteoDataTypeDes: '',
      submitProjectDetailStatus: false,
      dropProjectDetailStatus: false,

      TypeList: [
          // "Landuse",
          // "Soil",
          // "Geological",
          // "NDVI",
          // "Porosity",
          // "Topographical",
          "Elevation",
          "Slope",
          "Area"
      ],
      oldTypeList:[],
      typeSelect: "",
      uploaddata:{
          projectName:'',
          username:'',
          tiftype:''
      },
      projectName:'test1_river',
      username: '',
      tempStreamLayerGroup: [],


      // 数据管理表格
      tablecolumns1: [
          {
              title: 'Factor',
              width: 105,
              key: 'Factor'
          },
          {
              title: 'Source',
              width: 350,
              slot: 'source',
              key: 'Source',
          },
          {
              title: 'Action',
              slot: 'action',
              width: 120,
              key: 'Source',
          },
      ],
      tabledata1: [
          {
            Factor: "dem",
          },
      ],

      // 数据管理表格
      tablecolumns: [
          {
              type: 'selection',
              width: 60,
              align: 'center'
          },
          {
              title: 'Factor',
              width: 105,
              key: 'Factor'
          },
          {
              title: 'Source',
              width: 280,
              slot: 'source',
              key: 'Source',
          },
          {
              title: 'Action',
              slot: 'action',
              width: 115,
              key: 'Source',
          },
      ],

      tabledata: [
          {
            Factor: 'Landuse'
          },
          {
            Factor: 'Soiltype'
          },
          {
            Factor: 'Soil Properties'
          },
          {
            Factor: 'Geological'
          },
          {
            Factor: 'Climate'
          },
          {
            Factor: 'Permafrost'
          },
          {
            Factor: 'Glacier'
          },
          {
            Factor: 'NDVI'
          },
          {
            Factor: 'LAI'
          },
          {
            Factor: 'EVI'
          },
          {
            Factor: 'ET'
          },
          {
            Factor: 'NPP'
          },
          {
            Factor: 'GPP'
          },
          {
            Factor: 'Porosity'
          },
          {
            Factor: 'Subsurface Permeability'
          },
          {
            Factor: 'Population Count'
          },
          {
            Factor: 'Population Density'
          },
          {
            Factor: 'Road Density'
          },
          {
            Factor: 'Nighttime Lights 2013'
          },
          {
            Factor: 'Human Footprint 2009'
          },
          {
            Factor: 'Per Capita GDP 2015'
          },
          {
            Factor: 'Total GDP 2015'
          },
          {
            Factor: 'HDI 2009'
          },
      ],

      sourcedata1:{
        "dem":[
          "MERIT DEM"
        ],
      },

      sourcedata:{
        "Landuse":[
          "MODIS"
        ],
        "Soiltype":[
          "HWSD v2.0"
        ],
        "Soil Properties":[
          "SoilGrids"
        ],
        "Geological":[
          "GLiM"
        ],
        "Climate":
        [
          "ERA5"
        ],
        "Permafrost":
        [
          "ESA"
        ],
        "Glacier":
        [
          "RGI v7"
        ],
        "NDVI":[
          "MODIS"
        ],
        "LAI":[
          "MODIS"
        ],
        "EVI":[
          "MODIS"
        ],
        "ET":[
          "MODIS"
        ],
        "NPP":[
          "MODIS"
        ],
        "GPP":[
          "MODIS"
        ],
        "Porosity":[
          "GLHYMPS"
        ],
        "Subsurface Permeability":[
          "GLHYMPS"
        ],
        "Population Count":[
          "GPW4"
        ],
        "Population Density":[
          "GPW4"
        ],
        "Road Density":[
          "GRIP v4"
        ],
        "Nighttime Lights 2013":[
          "DMSP-OLS Nighttime Lights v4"
        ],
        "Human Footprint 2009":[
          "Human Footprint v2"
        ],
        "Per Capita GDP 2015":[
          "GDP PPP v2"
        ],
        "Total GDP 2015":[
          "GDP PPP v2"
        ],
        "HDI 2009":[
          "HDI v2"
        ],
      },
      sourceSelectdata:{
        "dem":"MERIT DEM",
        "Landuse":"MODIS",
        "Soiltype":"HWSD v2.0",
        "Soil Properties":"SoilGrids",
        "Geological":"GLiM",
        "Climate":"ERA5",
        "Permafrost":"ESA",
        "Glacier":"RGI v7",
        "NDVI":"MODIS",
        "LAI":"MODIS",
        "EVI":"MODIS",
        "ET":"MODIS",
        "NPP":"MODIS",
        "GPP":"MODIS",
        "Subsurface Permeability":"GLHYMPS",
        "Porosity":"GLHYMPS",
        "Population Count":"GPW4",
        "Population Density":"GPW4",
        "Road Density":"GRIP v4",
        "Nighttime Lights 2013":"DMSP-OLS Nighttime Lights v4",
        "Human Footprint 2009":"Human Footprint v2",
        "Per Capita GDP 2015":"GDP PPP v2",
        "Total GDP 2015":"GDP PPP v2",
        "HDI 2009":"HDI v2",
      },
      old_sourceSelectdata:{},
      globalsourcedata:{
        "dem":"MERIT DEM",
        "Landuse":"MODIS",
        "Soiltype":"HWSD v2.0",
        "Soil Properties":"SoilGrids",
        "Geological":"GLiM",
        "Climate":"ERA5",
        "Permafrost":"ESA",
        "Glacier":"RGI v7",
        "NDVI":"MODIS",
        "LAI":"MODIS",
        "EVI":"MODIS",
        "ET":"MODIS",
        "NPP":"MODIS",
        "GPP":"MODIS",
        "Subsurface Permeability":"GLHYMPS",
        "Porosity":"GLHYMPS",
        "Population Count":"GPW4",
        "Population Density":"GPW4",
        "Road Density":"GRIP v4",
        "Nighttime Lights 2013":"DMSP-OLS Nighttime Lights v4",
        "Human Footprint 2009":"Human Footprint v2",
        "Per Capita GDP 2015":"GDP PPP v2",
        "Total GDP 2015":"GDP PPP v2",
        "HDI 2009":"HDI v2",
      },

      chartDatas: {
        "Landuse":[],
        "Soiltype":[],
        "Geological":[],
      },
      chartData: {
        "Landuse":[],
        "Soiltype":[],
        "Geological":[],
      },
      textDatas: {
        "Soil Properties":[],
        "Climate":[],
        "Permafrost":[],
        "Glacier":[],
        "Porosity":[],
        "NDVI":[],
        "Elevation":[],
        "Slope":[],
        "Area":[],
        "NDVI":[],
        "LAI":[],
        "EVI":[],
        "ET":[],
        "NPP":[],
        "GPP":[],
        "Subsurface Permeability":[],
        "Population Count":[],
        "Population Density":[],
        "Road Density":[],
        "Nighttime Lights 2013":[],
        "Human Footprint 2009":[],
        "Per Capita GDP 2015":[],
        "Total GDP 2015":[],
        "HDI 2009":[],

      },
      textData: {
        "Soil Properties":"",
        "Climate":"",
        "Permafrost":"",
        "Glacier":"",
        "Porosity":"",
        "NDVI":"",
        "Elevation":"",
        "Slope":"",
        "Area":"",
        "NDVI":"",
        "LAI":"",
        "EVI":"",
        "ET":"",
        "NPP":"",
        "GPP":"",
        "Subsurface Permeability":"",
        "Population Count":"",
        "Population Density":"",
        "Road Density":"",
        "Nighttime Lights 2013":"",
        "Human Footprint 2009":"",
        "Per Capita GDP 2015":"",
        "Total GDP 2015":"",
        "HDI 2009":"",
      },

      Landuse:[
        {
          title: 'Evergreen Needleleaf Forests(%)',
          key: 'Evergreen Needleleaf Forests',
          align: 'center',
          width: 100,
        },
        {
          title: 'Evergreen Broadleaf Forests',
          key: 'Evergreen Broadleaf Forests',
          align: 'center',
          width: 100,
        },{
          title: 'Deciduous Needleleaf Forests',
          key: 'Deciduous Needleleaf Forests',
          align: 'center',
          width: 100,
        },{
          title: 'Deciduous Broadleaf Forests',
          key: 'Deciduous Broadleaf Forests',
          align: 'center',
          width: 100,
        },{
          title: 'Mixed Forests',
          key: 'Mixed Forests',
          align: 'center',
          width: 100,
        },{
          title: 'Closed Shrublands',
          key: 'Closed Shrublands',
          align: 'center',
          width: 110,
        },{
          title: 'Open Shrublands',
          key: 'Open Shrublands',
          align: 'center',
          width: 100,
        },{
          title: 'Woody Savannas',
          key: 'Woody Savannas',
          align: 'center',
          width: 100,
        },{
          title: 'Savannas',
          key: 'Savannas',
          align: 'center',
          width: 100,
        },{
          title: 'Grasslands',
          key: 'Grasslands',
          align: 'center',
          width: 100,
        },{
          title: 'Permanent Wetlands',
          key: 'Permanent Wetlands',
          align: 'center',
          width: 100,
        },{
          title: 'Croplands',
          key: 'Croplands',
          align: 'center',
          width: 100,
        },{
          title: 'Urban and Built-up Lands',
          key: 'Urban and Built-up Lands',
          align: 'center',
          width: 100,
        },{
          title: 'Cropland/Natural Vegetation Mosaics',
          key: 'Cropland/Natural Vegetation Mosaics',
          align: 'center',
          width: 100,
        },{
          title: 'Permanent Snow and Ice',
          key: 'Permanent Snow and Ice',
          align: 'center',
          width: 100,
        },{
          title: 'Barren',
          key: 'Barren',
          align: 'center',
          width: 100,
        },{
          title: 'Water Bodies',
          key: 'Water Bodies',
          align: 'center',
          width: 100,
        }
      ],
      Soiltype:[
        {
          title: 'Acrisols(%)',
          key: 'Acrisols',
          align: 'center',
          width: 70,
        },{
          title: 'Alisols',
          key: 'Alisols',
          align: 'center',
          width: 70,
        },{
          title: 'Andosols',
          key: 'Andosols',
          align: 'center',
          width: 70,
        },{
          title: 'Arenosols',
          key: 'Arenosols',
          align: 'center',
          width: 70,
        },{
          title: 'Anthrosols',
          key: 'Anthrosols',
          align: 'center',
          width: 70,
        },{
          title: 'Chernozems',
          key: 'Chernozems',
          align: 'center',
          width: 70,
        },{
          title: 'Calcisols',
          key: 'Calcisols',
          align: 'center',
          width: 70,
        },{
          title: 'Cambisols',
          key: 'Cambisols',
          align: 'center',
          width: 70,
        },{
          title: 'Cryosols',
          key: 'Cryosols',
          align: 'center',
          width: 70,
        },{
          title: 'Fluvisols',
          key: 'Fluvisols',
          align: 'center',
          width: 70,
        },{
          title: 'Ferralsols',
          key: 'Ferralsols',
          align: 'center',
          width: 70,
        },{
          title: 'Glaciers',
          key: 'Glaciers',
          align: 'center',
          width: 70,
        },{
          title: 'Gleysols',
          key: 'Gleysols',
          align: 'center',
          width: 70,
        },{
          title: 'Gypsisols',
          key: 'Gypsisols',
          align: 'center',
          width: 70,
        },{
          title: 'Histosols',
          key: 'Histosols',
          align: 'center',
          width: 70,
        },{
          title: 'Islands',
          key: 'Islands',
          align: 'center',
          width: 70,
        },{
          title: 'Kastanozems',
          key: 'Kastanozems',
          align: 'center',
          width: 75,
        },{
          title: 'Leptosols',
          key: 'Leptosols',
          align: 'center',
          width: 70,
        },{
          title: 'Luvisols',
          key: 'Luvisols',
          align: 'center',
          width: 70,
        },{
          title: 'Lixisols',
          key: 'Lixisols',
          align: 'center',
          width: 70,
        },{
          title: 'Nitisols',
          key: 'Nitisols',
          align: 'center',
          width: 70,
        },{
          title: 'Phaeozems',
          key: 'Phaeozems',
          align: 'center',
          width: 70,
        },{
          title: 'Planosols',
          key: 'Planosols',
          align: 'center',
          width: 70,
        },{
          title: 'Plinthosols',
          key: 'Plinthosols',
          align: 'center',
          width: 70,
        },
        {
          title: 'Podzols',
          key: 'Podzols',
          align: 'center',
          width: 70,
        },{
          title: 'Regosols',
          key: 'Regosols',
          align: 'center',
          width: 70,
        },{
          title: 'Retisols',
          key: 'Retisols',
          align: 'center',
          width: 70,
        },{
          title: 'Solonchaks',
          key: 'Solonchaks',
          align: 'center',
          width: 70,
        },{
          title: 'Solonetz',
          key: 'Solonetz',
          align: 'center',
          width: 70,
        },{
          title: 'Stagnosols',
          key: 'Stagnosols',
          align: 'center',
          width: 70,
        },{
          title: 'Technosols',
          key: 'Technosols',
          align: 'center',
          width: 70,
        },{
          title: 'Umbrisols',
          key: 'Umbrisols',
          align: 'center',
          width: 70,
        },{
          title: 'Vertisols',
          key: 'Vertisols',
          align: 'center',
          width: 70,
        },{
          title: 'Open Water',
          key: 'Open Water',
          align: 'center',
          width: 70,
        },{
          title: 'No Data',
          key: 'No Data',
          align: 'center',
          width: 70,
        }
      ],
      Soil_Properties:[
        {
          title: 'bdod_0-5cm_max(cg/cm3)',
          key: 'bdod_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_0-5cm_min',
          key: 'bdod_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_0-5cm_mean',
          key: 'bdod_0-5cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'bdod_5-15cm_max',
          key: 'bdod_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_5-15cm_min',
          key: 'bdod_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_5-15cm_mean',
          key: 'bdod_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'bdod_15-30cm_max',
          key: 'bdod_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_15-30cm_min',
          key: 'bdod_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_15-30cm_mean',
          key: 'bdod_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'bdod_30-60cm_max',
          key: 'bdod_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_30-60cm_min',
          key: 'bdod_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_30-60cm_mean',
          key: 'bdod_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'bdod_60-100cm_max',
          key: 'bdod_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_60-100cm_min',
          key: 'bdod_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_60-100cm_mean',
          key: 'bdod_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'bdod_100-200cm_max',
          key: 'bdod_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_100-200cm_min',
          key: 'bdod_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'bdod_100-200cm_mean',
          key: 'bdod_100-200cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'cfvo_0-5cm_max(Per10000)',
          key: 'cfvo_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_0-5cm_min',
          key: 'cfvo_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_0-5cm_mean',
          key: 'cfvo_0-5cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'cfvo_5-15cm_max',
          key: 'cfvo_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_5-15cm_min',
          key: 'cfvo_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_5-15cm_mean',
          key: 'cfvo_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'cfvo_15-30cm_max',
          key: 'cfvo_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_15-30cm_min',
          key: 'cfvo_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_15-30cm_mean',
          key: 'cfvo_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'cfvo_30-60cm_max',
          key: 'cfvo_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_30-60cm_min',
          key: 'cfvo_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_30-60cm_mean',
          key: 'cfvo_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'cfvo_60-100cm_max',
          key: 'cfvo_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_60-100cm_min',
          key: 'cfvo_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_60-100cm_mean',
          key: 'cfvo_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'cfvo_100-200cm_max',
          key: 'cfvo_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_100-200cm_min',
          key: 'cfvo_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'cfvo_100-200cm_mean',
          key: 'cfvo_100-200cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'clay_0-5cm_max(g/kg)',
          key: 'clay_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_0-5cm_min',
          key: 'clay_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_0-5cm_mean',
          key: 'clay_0-5cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'clay_5-15cm_max',
          key: 'clay_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_5-15cm_min',
          key: 'clay_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_5-15cm_mean',
          key: 'clay_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'clay_15-30cm_max',
          key: 'clay_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_15-30cm_min',
          key: 'clay_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_15-30cm_mean',
          key: 'clay_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'clay_30-60cm_max',
          key: 'clay_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_30-60cm_min',
          key: 'clay_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_30-60cm_mean',
          key: 'clay_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'clay_60-100cm_max',
          key: 'clay_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_60-100cm_min',
          key: 'clay_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_60-100cm_mean',
          key: 'clay_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'clay_100-200cm_max',
          key: 'clay_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'clay_100-200cm_min',
          key: 'clay_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'clay_100-200cm_mean',
          key: 'clay_100-200cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'sand_0-5cm_max(g/kg)',
          key: 'sand_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_0-5cm_min',
          key: 'sand_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_0-5cm_mean',
          key: 'sand_0-5cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'sand_5-15cm_max',
          key: 'sand_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_5-15cm_min',
          key: 'sand_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_5-15cm_mean',
          key: 'sand_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'sand_15-30cm_max',
          key: 'sand_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_15-30cm_min',
          key: 'sand_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_15-30cm_mean',
          key: 'sand_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'sand_30-60cm_max',
          key: 'sand_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_30-60cm_min',
          key: 'sand_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_30-60cm_mean',
          key: 'sand_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'sand_60-100cm_max',
          key: 'sand_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_60-100cm_min',
          key: 'sand_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_60-100cm_mean',
          key: 'sand_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'sand_100-200cm_max',
          key: 'sand_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'sand_100-200cm_min',
          key: 'sand_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'sand_100-200cm_mean',
          key: 'sand_100-200cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'silt_0-5cm_max(g/kg)',
          key: 'silt_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_0-5cm_min',
          key: 'silt_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_0-5cm_mean',
          key: 'silt_0-5cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'silt_5-15cm_max',
          key: 'silt_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_5-15cm_min',
          key: 'silt_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_5-15cm_mean',
          key: 'silt_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'silt_15-30cm_max',
          key: 'silt_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_15-30cm_min',
          key: 'silt_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_15-30cm_mean',
          key: 'silt_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'silt_30-60cm_max',
          key: 'silt_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_30-60cm_min',
          key: 'silt_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_30-60cm_mean',
          key: 'silt_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'silt_60-100cm_max',
          key: 'silt_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_60-100cm_min',
          key: 'silt_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_60-100cm_mean',
          key: 'silt_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'silt_100-200cm_max',
          key: 'silt_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'silt_100-200cm_min',
          key: 'silt_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'silt_100-200cm_mean',
          key: 'silt_100-200cm_mean',
          align: 'center',
          width: 100,
        },
        
        {
          title: 'soc_0-5cm_max(g/kg)',
          key: 'soc_0-5cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_0-5cm_min',
          key: 'soc_0-5cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_0-5cm_mean',
          key: 'soc_0-5cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'soc_5-15cm_max',
          key: 'soc_5-15cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_5-15cm_min',
          key: 'soc_5-15cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_5-15cm_mean',
          key: 'soc_5-15cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'soc_15-30cm_max',
          key: 'soc_15-30cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_15-30cm_min',
          key: 'soc_15-30cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_15-30cm_mean',
          key: 'soc_15-30cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'soc_30-60cm_max',
          key: 'soc_30-60cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_30-60cm_min',
          key: 'soc_30-60cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_30-60cm_mean',
          key: 'soc_30-60cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'soc_60-100cm_max',
          key: 'soc_60-100cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_60-100cm_min',
          key: 'soc_60-100cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_60-100cm_mean',
          key: 'soc_60-100cm_mean',
          align: 'center',
          width: 100,
        },

        {
          title: 'soc_100-200cm_max',
          key: 'soc_100-200cm_max',
          align: 'center',
          width: 100,
        },{
          title: 'soc_100-200cm_min',
          key: 'soc_100-200cm_min',
          align: 'center',
          width: 100,
        },{
          title: 'soc_100-200cm_mean',
          key: 'soc_100-200cm_mean',
          align: 'center',
          width: 100,
        },

      ],
      Topographical:[
        {
          title: 'Elevation_max(m)',
          key: 'Elevation_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Elevation_min',
          key: 'Elevation_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Elevation_mean',
          key: 'Elevation_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Slope_max(radians)',
          key: 'Slope_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Slope_min',
          key: 'Slope_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Slope_mean',
          key: 'Slope_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Area(m2)',
          key: 'Area',
          align: 'center',
          width: 70,
        },
      ],
      Geological:[
        {
          title: 'Intermediate Volcanic Rocks(%)',
          key: 'Intermediate Volcanic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Basic Volcanic Rocks',
          key: 'Basic Volcanic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Acid Plutonic Rocks',
          key: 'Acid Plutonic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Metamorphic Rocks',
          key: 'Metamorphic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Unconsolidated Sediments',
          key: 'Unconsolidated Sediments',
          align: 'center',
          width: 100,
        },{
          title: 'Siliciclastic Sedimentary Rocks',
          key: 'Siliciclastic Sedimentary Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Basic Plutonic Rocks',
          key: 'Basic Plutonic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Intermediate Plutonic Rocks',
          key: 'Intermediate Plutonic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Mixed Sedimentary Rocks',
          key: 'Mixed Sedimentary Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Water Bodies',
          key: 'Water Bodies',
          align: 'center',
          width: 100,
        },{
          title: 'Pyroclastic',
          key: 'Pyroclastic',
          align: 'center',
          width: 100,
        },{
          title: 'Carbonate Sedimentary Rocks',
          key: 'Carbonate Sedimentary Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Acid Volcanic Rocks',
          key: 'Acid Volcanic Rocks',
          align: 'center',
          width: 100,
        },{
          title: 'Evaporites',
          key: 'Evaporites',
          align: 'center',
          width: 100,
        },{
          title: 'Ice and Glaciers',
          key: 'Ice and Glaciers',
          align: 'center',
          width: 100,
        },{
          title: 'No Data',
          key: 'No Data',
          align: 'center',
          width: 100,
        }
      ],
      Climate:[
        {
          title: 'Dewpoint 2m Temperature_max(K)',
          key: 'dewpoint_2m_temperature_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Dewpoint 2m Temperature_mean',
          key: 'dewpoint_2m_temperature_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Dewpoint 2m Temperature_min',
          key: 'dewpoint_2m_temperature_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean 2m Air Temperature_max(K)',
          key: 'mean_2m_air_temperature_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean 2m Air Temperature_mean',
          key: 'mean_2m_air_temperature_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean 2m Air Temperature_min',
          key: 'mean_2m_air_temperature_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_U_10m_max(m/s)',
          key: 'wind_u_10m_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_U_10m_mean',
          key: 'wind_u_10m_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_U_10m_min',
          key: 'wind_u_10m_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_V_10m_max(m/s)',
          key: 'wind_v_10m_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_V_10m_mean',
          key: 'wind_v_10m_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_V_10m_min',
          key: 'wind_v_10m_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_10m_max(m/s)',
          key: 'wind_10m_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_10m_mean',
          key: 'wind_10m_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Wind_10m_min',
          key: 'wind_10m_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Max 2m Air Temperature_max(K)',
          key: 'max_2m_air_temperature_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Max 2m Air Temperature_mean',
          key: 'max_2m_air_temperature_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Max 2m Air Temperature_min',
          key: 'max_2m_air_temperature_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Min 2m Air Temperature_max(K)',
          key: 'min_2m_air_temperature_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Min 2m Air Temperature_mean',
          key: 'min_2m_air_temperature_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Min 2m Air Temperature_min',
          key: 'min_2m_air_temperature_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Total Precipitation_max(m)',
          key: 'total_precipitation_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Total Precipitation_mean',
          key: 'total_precipitation_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Total Precipitation_min',
          key: 'total_precipitation_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Surface Pressure_max(Pa)',
          key: 'surface_pressure_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Surface Pressure_mean',
          key: 'surface_pressure_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Surface Pressure_min',
          key: 'surface_pressure_min',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean Sea Level Pressure_max(Pa)',
          key: 'mean_sea_level_pressure_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean Sea Level Pressure_mean',
          key: 'mean_sea_level_pressure_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Mean Sea Level Pressure_min',
          key: 'mean_sea_level_pressure_min',
          align: 'center',
          width: 100,
        },
      ],
      Permafrost:[
        {
          title: 'Permafrost Area(m2)',
          key: 'permafrost_area_m2',
          align: 'center',
          width: 100,
        },
        {
          title: 'Permafrost Area(%)',
          key: 'permafrost_area_%',
          align: 'center',
          width: 100,
        },
        {
          title: 'Active Layer_mean(m)',
          key: 'active_layer_mean',
          align: 'center',
          width: 100,
        },
        {
          title: 'Active Layer_max',
          key: 'active_layer_max',
          align: 'center',
          width: 100,
        },
        {
          title: 'Active Layer_min',
          key: 'active_layer_min',
          align: 'center',
          width: 100,
        },
      ],
      Glacier:[
        {
          title: 'Glacier Area(m2)',
          key: 'glacier_area_m2',
          align: 'center',
          width: 100,
        },
        {
          title: 'Glacier Area(%)',
          key: 'glacier_area_%',
          align: 'center',
          width: 100,
        },
      ],
      NDVI:[
        {
          title: 'NDVI_max',
          key: 'NDVI_max',
          align: 'center',
          width: 100,
        },{
          title: 'NDVI_min',
          key: 'NDVI_min',
          align: 'center',
          width: 100,
        },{
          title: 'NDVI_mean',
          key: 'NDVI_mean',
          align: 'center',
          width: 100,
        },
      ],
      LAI:[
        {
          title: 'LAI_max',
          key: 'LAI_max',
          align: 'center',
          width: 70,
        },{
          title: 'LAI_min',
          key: 'LAI_min',
          align: 'center',
          width: 70,
        },{
          title: 'LAI_mean',
          key: 'LAI_mean',
          align: 'center',
          width: 70,
        },
      ],
      ET:[
        {
          title: 'ET_max(kg/m2/8day)',
          key: 'ET_max',
          align: 'center',
          width: 70,
        },{
          title: 'ET_min',
          key: 'ET_min',
          align: 'center',
          width: 70,
        },{
          title: 'ET_mean',
          key: 'ET_mean',
          align: 'center',
          width: 70,
        },
      ],
      EVI:[
        {
          title: 'EVI_max',
          key: 'EVI_max',
          align: 'center',
          width: 70,
        },{
          title: 'EVI_min',
          key: 'EVI_min',
          align: 'center',
          width: 70,
        },{
          title: 'EVI_mean',
          key: 'EVI_mean',
          align: 'center',
          width: 70,
        },
      ],
      GPP:[
        {
          title: 'GPP_max(kg*C/m2)',
          key: 'GPP_max',
          align: 'center',
          width: 70,
        },{
          title: 'GPP_min',
          key: 'GPP_min',
          align: 'center',
          width: 70,
        },{
          title: 'GPP_mean',
          key: 'GPP_mean',
          align: 'center',
          width: 70,
        },
      ],
      NPP:[
        {
          title: 'NPP_max(kg*C/m2)',
          key: 'NPP_max',
          align: 'center',
          width: 70,
        },{
          title: 'NPP_min',
          key: 'NPP_min',
          align: 'center',
          width: 70,
        },{
          title: 'NPP_mean',
          key: 'NPP_mean',
          align: 'center',
          width: 70,
        },
      ],
      Porosity:[
        {
          title: 'Porosity_max',
          key: 'Porosity_max',
          align: 'center',
          width: 100,
        },{
          title: 'Porosity_min',
          key: 'Porosity_min',
          align: 'center',
          width: 100,
        },{
          title: 'Porosity_mean',
          key: 'Porosity_mean',
          align: 'center',
          width: 100,
        },
      ],
      Subsurface_Permeability:[
        {
          title: 'Subsurface_Permeability_max(m2)',
          key: 'Subsurface Permeability_max',
          align: 'center',
          width: 100,
        },{
          title: 'Subsurface_Permeability_min',
          key: 'Subsurface Permeability_min',
          align: 'center',
          width: 100,
        },{
          title: 'Subsurface_Permeability_mean',
          key: 'Subsurface Permeability_mean',
          align: 'center',
          width: 100,
        },
      ],
      Population_Count:[
        {
          title: 'Population_Count_sum(people)',
          key: 'Population Count_sum',
          align: 'center',
          width: 100,
        },{
          title: 'Population_Count_max',
          key: 'Population Count_max',
          align: 'center',
          width: 100,
        },{
          title: 'Population_Count_min',
          key: 'Population Count_min',
          align: 'center',
          width: 100,
        },{
          title: 'Population_Count_mean',
          key: 'Population Count_mean',
          align: 'center',
          width: 100,
        },
      ],
      Population_Density:[
        {
          title: 'Population_Density_max(people/km2)',
          key: 'Population Density_max',
          align: 'center',
          width: 100,
        },{
          title: 'Population_Density_min',
          key: 'Population Density_min',
          align: 'center',
          width: 100,
        },{
          title: 'Population_Density_mean',
          key: 'Population Density_mean',
          align: 'center',
          width: 100,
        },
      ],
      Road_Density:[
        {
          title: 'Road_Density_max(m/km2)',
          key: 'Road Density_max',
          align: 'center',
          width: 100,
        },{
          title: 'Road_Density_min',
          key: 'Road Density_min',
          align: 'center',
          width: 100,
        },{
          title: 'Road_Density_mean',
          key: 'Road Density_mean',
          align: 'center',
          width: 100,
        },
      ],
      Stable_Lights:[
        {
          title: 'Stable_Lights_sum',
          key: 'Nighttime Lights 2013_sum', // type + "_max"
          align: 'center',
          width: 100,
        },{
          title: 'Stable_Lights_max',
          key: 'Nighttime Lights 2013_max', // type + "_max"
          align: 'center',
          width: 100,
        },{
          title: 'Stable_Lights_min',
          key: 'Nighttime Lights 2013_min',
          align: 'center',
          width: 100,
        },{
          title: 'Stable_Lights_mean',
          key: 'Nighttime Lights 2013_mean',
          align: 'center',
          width: 100,
        },
      ],
      Human_Footprint:[
        {
          title: 'Human_Footprint_2009_sum',
          key: 'Human Footprint 2009_sum',
          align: 'center',
          width: 100,
        },{
          title: 'Human_Footprint_2009_max',
          key: 'Human Footprint 2009_max',
          align: 'center',
          width: 100,
        },{
          title: 'Human_Footprint_2009_min',
          key: 'Human Footprint 2009_min',
          align: 'center',
          width: 100,
        },{
          title: 'Human_Footprint_2009_mean',
          key: 'Human Footprint 2009_mean',
          align: 'center',
          width: 100,
        },
      ],
      Per_Capita_GDP:[
        {
          title: 'Per_Capita_GDP_2015_max(dollar/people)',
          key: 'Per Capita GDP 2015_max',
          align: 'center',
          width: 100,
        },{
          title: 'Per_Capita_GDP_2015_min',
          key: 'Per Capita GDP 2015_min',
          align: 'center',
          width: 100,
        },{
          title: 'Per_Capita_GDP_2015_mean',
          key: 'Per Capita GDP 2015_mean',
          align: 'center',
          width: 100,
        }
      ],
      Total_GDP:[
        {
          title: 'Total_GDP_sum(dollar)',
          key: 'Total GDP 2015_sum',
          align: 'center',
          width: 100,
        },{
          title: 'Total_GDP_max',
          key: 'Total GDP 2015_max',
          align: 'center',
          width: 100,
        },{
          title: 'Total_GDP_min',
          key: 'Total GDP 2015_min',
          align: 'center',
          width: 100,
        },{
          title: 'Total_GDP_mean',
          key: 'Total GDP 2015_mean',
          align: 'center',
          width: 100,
        },
      ],
      HDI:[
        {
          title: 'HDI_max',
          key: 'HDI 2009_max',
          align: 'center',
          width: 100,
        },{
          title: 'HDI_min',
          key: 'HDI 2009_min',
          align: 'center',
          width: 100,
        },{
          title: 'HDI_mean',
          key: 'HDI 2009_mean',
          align: 'center',
          width: 100,
        },
      ],

      selecttabledata: [], // 用于存储选中的数据
      selectPOISwitch: false,
      tableLoading: false,
      POIdata: [],
      oldPOIdata: [],
      mapCM: null,
      POILayers: null,
      pointSelect: "",
      POIcolumns: [
        {
            type: 'index',
            width: 60,
            align: 'center'
        },
        {
            title: 'Lon',
            key: 'lon'
        },
        {
            title: 'Lat',
            key: 'lat'
        },
        {
            title: 'Action',
            slot: 'action3',
            width: 210,
            align: 'center',
        }
      ],
      staticDataModal: false,
      basinType: 1,//1:流域上游，2：湖泊流域
      radius: 100,
      oldradius: 100,
      pointList: [],
    }
  },
  methods: {
    previousStep(){
      this.activeKey -= 1
    },
    nextStep(){
      this.activeKey += 1
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        fetch('`${apiBaseUrl}/infboy/upload`', {
          method: 'POST',
          body: formData
        })
          .then(response => {
            const randomParam = Math.random();
            const randomParam2 = Math.random();
            const newURL2 = '`${apiBaseUrl}/infboy/downLandUseSta?rand=`' + randomParam + randomParam2;
            var downloadRandName2 = 'downloadLink' + randomParam2;
            downloadRandName2 = document.createElement('a');
            downloadRandName2.href = newURL2;
            //downloadRandName2.target = '_blank'; // 在新标签页中打开下载链接
            // 模拟点击下载链接
            downloadRandName2.click();
            console.log(response);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        alert('Please select a CSV file.');
      }
    },
    addCrossCursor() {
      this.$el.classList.add('cross-cursor');
    },
    removeCrossCursor() {
      this.$el.classList.remove('cross-cursor');
    },
    modalVisible(isVisible) {
      // console.log(isVisible);
      this.$emit('update:createModelShow', isVisible); //实现createModelShow的双向绑定
    },
    namedProject(name) {
      this.namedProjectBtnStatus = true;
      // 从sessionStorage获取数据
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.isProjectNameVaild = true
          console.log(this.formProjectItem.projectName)
          this.$store.commit("SET_PROJECT_NAME", this.formProjectItem.projectName);
          this.$Notice.success({
            title: '项目命名完成',
            duration: 3
          });
          setTimeout(() => {
            this.namedProjectBtnStatus = false;
          }, 200);
        }
      })
    },
    createProject() {
      this.namedProject('formProjectItem')
      this.createProjectStatus = 'modelRunning';
      const username = sessionStorage.getItem('username');
      console.log(username)
      const projectName = this.projectName;
      console.log(projectName)
      if (this.isProjectNameVaild) {
        let params = new URLSearchParams();
        params.append("newProjectName", this.projectName);
        params.append("userName", username);
        request
          .post('/project/create', params)
          .then(res => {
            if (res.data.errCode == 200) {
              this.$Message.success({
                content: '项目创建成功！',
                duration: 3
              });
              this.createProjectStatus = 'modelRunSuccessed';
              // this.$store.commit("SET_PROJECT_NAME", this.formProjectItem.projectName);
            } else {
              this.$Message.error({
                content: '项目已存在，请重新创建！',
                duration: 3,
              });
              this.formProjectItem.projectName = '';
              this.createProjectStatus = 'modelSetting';
              this.isProjectNameVaild = false;
            }
          })
          .catch(e => {
            console.log(e)
            this.$Message.error('项目创建失败，请重新创建！');
            this.createProjectStatus = 'modelSetting';
          });
      } else {
        this.$Message.error({
          content: '项目名称错误，请重新设置！',
          duration: 3,
        });
        this.formProjectItem.projectName = '';
        this.createProjectStatus = 'modelSetting';
        this.isProjectNameVaild = true
      }
    },
    giveUpCurrentProject() {
      this.formProjectItem.projectName = ''
      this.createProjectStatus = 'modelSetting';
      //todo 后端编写删除当前项目文件
    },
    handleSubmitProject(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('Success!');
        } else {
          this.$Message.error('Fail!');
        }
      })
    },
    initController() {
      //
      this.drawingLayerGroup = L.layerGroup([]);
      this.drawingLayerGroup.addTo(this.mapCM);
      //
      this.drawingBasinLayerGroup = L.layerGroup([]);
      this.drawingBasinLayerGroup.addTo(this.mapCM);
      //
      this.drawingSubBasinLayerGroup = L.layerGroup([]);
      this.drawingSubBasinLayerGroup.addTo(this.mapCM);
      //
      this.streamLayerGroup = L.layerGroup([]);
      this.streamLayerGroup.addTo(this.mapCM);
      //
      this.HLULayerGroup = L.layerGroup([]);
      this.HLULayerGroup.addTo(this.mapCM);
      //
      this.subBasinOutletLayerGroup = L.layerGroup([]);
      this.subBasinOutletLayerGroup.addTo(this.mapCM);


      var options = {
        position: "topright", // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
        drawMarker: true, // adds button to draw markers
        drawCircleMarker: false,
        drawPolyline: false, // adds button to draw a polyline
        drawRectangle: false, // adds button to draw a rectangle
        drawPolygon: false, // adds button to draw a polygon
        drawCircle: false, // adds button to draw a cricle
        cutPolygon: false, // adds button to cut a hole in a polygon
        editMode: true, // adds button to toggle edit mode for all layers
        dragMode: false,
        removalMode: true // adds a button to remove layers
      };
      this.mapCM.pm.addControls(options);
    },
    listenDraw() {
      //地图点击监听
      this.mapCM.on('click', e => {
        if (this.selectPOISwitch) {
          var latlng = e.latlng;
          var lon = latlng['lng'];
          var lat = latlng['lat'];

          let newData = {}
          newData['lat'] = lat
          newData['lon'] = lon

          if(!this.POIdata.includes(newData)) {
              this.POIdata.push(newData)
              // this.$store.commit("SET_POI_LIST", this.data);
              let marker = L.marker(new L.LatLng(lat, lon), { // 创建点
              }).addTo(this.POILayers)//添加到图层
          }
          if(this.pointSelect == "") {
              this.pointSelect = 1
              // this.$store.commit("SET_POI_SELECT", 1);
          }
          console.log(this.pointSelect)
        }
      });
      this.mapCM.on('contextmenu', e => {
        console.log("右击了")
        if (this.selectPOISwitch) {
          this.riverShowTemp = true;
          //改指针.
          eventBus.$emit("change-cursor-pointer");
          this.selectPOISwitch = false;
        }
      })
    },
    initLevelLabel() {
      for (var i = 2; i < 11; i++) {
        var item = {
          value: i,
          label: 'level ' + i
        }
        this.levelLayerList.push(item);
      }
    },
    addUpstreamClickPoint(type, lon, lat) {
      if (type == 'basinOutlet') {
        this.removeUpstreamClickPoint()
        this.ucpLayer = L.marker([lat, lon], {
          icon: new L.Icon({
            className: "rivermap-icon",
            iconUrl: require('../../assets/riverpoint.png'),
            iconSize: [24, 24],
            iconAnchor: [12, 24],
          })
        })
        this.mapCM.addLayer(this.ucpLayer);
        // this.drawingBasinLayerGroup.addLayer(this.ucpLayer);
        // var id = this.drawingBasinLayerGroup.getLayerId(this.ucpLayer);
        // console.log(id);
        //更新store.
        this.$store.commit("SET_BASINOUTLETLAYER_OBJECT", this.ucpLayer);
        //改图层父组件中图层的状态
        this.$emit("changeLayerStatus", "basinoutlet", true)
      } else if (type == 'subBasinOutlet') {
        var layer = L.marker([lat, lon], {
          icon: new L.Icon({
            className: "rivermap-icon",
            iconUrl: require('../../assets/subBasinOutlet.png'),
            iconSize: [24, 24],
            iconAnchor: [12, 24],
          })
        })

        this.subBasinOutletLayerGroup.addLayer(layer)
        this.$store.commit("SET_SUBBASINOUTLETLAYER_OBJECT", this.subBasinOutletLayerGroup);
        //改图层父组件中图层的状态.千万不能提交多次
        if (this.subBasinOutletLayerStatus == false)
          this.$emit("changeLayerStatus", "subbasinoutlet", true)
        this.subBasinOutletLayerStatus = true;
      }

    },
    removeUpstreamClickPoint() {
      if (this.ucpLayer !== null) {
        this.ucpLayer.remove();
      }
    },
    changeStandardBasinsLevel() {
      try {
        this.basinLayer.remove();
      } catch { }
      var level = this.levelSelect;
      //   this.basinLayer = L.tileLayer.wms('http://210.26.48.56:30122/geoserver/Basin_shp/wms',{
      this.basinLayer = L.tileLayer.wms('http://223.2.41.136:7070/geoserver/Basin_shp/wms', {
        layers: 'Asia_level_0' + level,
        format: 'image/png',
        transparent: true,
        noWarp: true
      }).addTo(this.mapCM);
      console.log('Show Standard Basin Layer in Level ' + level + '.');
    },
    changeBasinScopeDataResource() {
      if (this.basinScopeType !== 'basinScopeFromSystem') {
        this.basinCkb = false;
        // this.querySwitch=false;
        this.upstreamByClickSwitch = false;
        try {
          this.basinLayer.remove();
          this.showBasinsLayer(false)
        } catch { }
      }
    },
    //根据离散颜色及数据范围生成对应值的颜色
    getSeparatedColorByVal(minVal, maxVal, colors, val) {
      let length = colors.length;
      let avg = ((maxVal - minVal) / length).toFixed(4);
      //生成等分区间
      let regions = [];
      for (let i = 0; i < length; i++) {
        if (i === length - 1) {
          regions.push([(minVal + avg * i), maxVal]);
        } else {
          regions.push([(minVal + avg * i), (minVal + avg * (i + 1))]);
        }
      }
      //返回对应值颜色
      for (let i = 0; i < regions.length; i++) {
        if (val >= regions[i][0] && val <= regions[i][1]) {
          return colors[i];
        }
      }
    },
    // 随机生成是十六进制颜色
    getRandomHexColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },

    addGeoJSONToMap(type, GeoJSONStr, color) {
      var file = JSON.parse(GeoJSONStr);

      var fillOpacity = 0;
      var stroke = false;
      // switch (type) {
      //   case 'basinLayer':
      //     fillOpacity = 0;
      //     break;
      //   case 'subBasinLayer':
      //     fillOpacity = 0.2;
      //     break;
      // }

      // let separatedColors = ['#DAF7A6', '#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845'];//离散颜色
      const separatedColors = [
        "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF6666", "#FF6699", "#FF66CC", "#FF66FF", "#FF9900", "#FF9933", "#FF9966", "#FF9999", "#FF99CC", "#FF99FF", "#FFCC00", "#FFCC33", "#FFCC66", "#FFCC99", "#FFCCCC", "#FFCCCC", "#FFFF00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC",
        "#00FF00", "#00FF33", "#00FF66", "#00FF99", "#00FFCC", "#00FFFF", "#0033FF", "#0033CC", "#003399", "#003366", "#003333", "#0033FF", "#0066FF", "#0066CC", "#006699", "#006666", "#006633", "#0099FF", "#0099CC", "#009999", "#009966", "#00CCFF", "#00CCCC", "#00CC99", "#00CC66", "#FFFF3F", "#FFFF8C", "#FFFFBF",
        "#C28F5C", "#C8B47F", "#CBCDA4", "#D1D1E1", "#D4B4A8", "#D7B7A4", "#DECBAD", "#E5C5BD", "#E8E4D4", "#EBDCD5", "#EFD8F1", "#F2F2F2", "#F4C5C4", "#F7B4B4", "#FADBDC", "#FDA5DC", "#FFFFFF", "#F7D7A8", "#F5B47D", "#F2B4B4", "#F2D1E2", "#F2D1E5", "#F5D7E2", "#F5D7E5", "#F5D7E8", "#F7D7E8", "#F7D7EC", "#FAD7E8", "#FAD7EC",
        "#A1CAF1", "#B1D1FC", "#BACED8", "#BDCDFE", "#BFC2FB", "#BFC2FC", "#BFC2FD", "#BFC2FE", "#C7DFDF", "#C7E8FE", "#CBEAF8", "#CFDEDF", "#CFE8FE", "#CFE8FD", "#CFE8FC", "#CFE8FB", "#D7E8FD", "#D7E8FE", "#D7E8FD", "#D7E8FC"

      ];
      // #FF0000: 红色
      // #00FF00: 绿色
      // #0000FF: 蓝色
      // #FFFF00: 黄色
      // #00FFFF: 青色
      // #FF00FF: 品红
      // #C0C0C0: 银色
      // #808080: 灰色
      // #FFA500: 橙色
      // #8B4513: 深棕色
      // #9400D3: 紫色
      // #A9A9A9: 中灰色
      // #B8860B: 浅黄色
      // #7789D5: 浅蓝色
      // #6B8E23: 橄榄绿
      // #CD5C5C: 砖红色
      // #DC143C: 紫红色
      // #4682B4: 深蓝色
      // #B22222: 猩红色
      // #FDBE62: 米色
      let minVal = 1;
      let maxVal = 49;
      let _this = this

      if (type == "subBasinLayer") {
        stroke = true
      }

      if (type == "basinLayer" || type == "streamLayer") {
        fillOpacity = 0;
        stroke = true;
      }
      else fillOpacity = 0.3;

      var geoJsonLayer = L.geoJSON(file, {
        // style: function (feature) {
        //   feature.properties.value = random(1, 100);
        //   feature.properties.color = getSeparatedColorByVal(minVal, maxVal, separatedColors, feature.properties.value);
        //   return { color: color, fillColor: feature.properties.color, fillOpacity: fillOpacity };
        //   // return { color: color, fillColor: color, fillOpacity: fillOpacity };
        // }
        mouseCancelMove: false,
        onEachFeature: function (feature, layer) {

          // console.log(feature.properties.VALUE)
          // if (feature.properties.VALUE == null) {
          //   console.log("feature.properties.VALUE == null")
          //   feature.properties.VALUE = 1//红色
          // }
          feature.properties.color = _this.getRandomHexColor();
          // feature.properties.color = _this.getSeparatedColorByVal(minVal, maxVal, separatedColors, feature.properties.VALUE);
          console.log(feature.properties.color)

          layer.setStyle({
            stroke: stroke,//取消边框
            color: color,
            fillColor: feature.properties.color,
            fillOpacity: fillOpacity,//默认0.2
            weight: 1,
          });
          //popup弹窗
          // layer.bindPopup(feature.properties.VALUE);
          if (type == 'HLULayer') {
            layer.on({
              click: (e) => {
                const prop = e.target.feature.properties;
                _this.clickHLUid = prop.VALUE;
                console.log(prop.VALUE)
              }
            })
          }
        }
      }).bindPopup(function (layer) {
        return layer.feature.properties.description;
      });
      // this.HLUlayer = geoJsonLayer;
      this.loadFeatures(type, geoJsonLayer);
      //平移至数据位置
      // this.mapCM.fitBounds(geoJsonLayer.getBounds());

      // this.mapCM.on('click', function (e) {
      //   var features = geoJsonLayer.getLayers();
      //   for (var i in features) {
      //     console.log(features[i])
      //     console.log(e)
      //     // if (features[i]._path && features[i]._path._rings[0][0] == e.latlng.lat && features[i]._path._rings[0][1] == e.latlng.lng) {
      //     //   console.log(features[i]._path._rings[0][2]);
      //     // }
      //   }
      // });
    },
    //222
    loadFeatures(type, featureCollection) {
      switch (type) {
        case 'basinLayer':
          featureCollection.eachLayer(layer => {
            this.drawingBasinLayerGroup.addLayer(layer);
          });
          this.$store.commit("SET_BASINBOUNDLAYER_OBJECT", this.drawingBasinLayerGroup);
          break;
        case 'subBasinLayer':
          this.drawingSubBasinLayerGroup.clearLayers();
          featureCollection.eachLayer(layer => {
            this.drawingSubBasinLayerGroup.addLayer(layer);
          });
          this.$store.commit("SET_SUBBASINLAYER_OBJECT", this.drawingSubBasinLayerGroup);//在getdatashowcontrol组件中相应更改
          break;
        case 'streamLayer':
          this.streamLayerGroup.clearLayers();
          featureCollection.eachLayer(layer => {
            this.streamLayerGroup.addLayer(layer);
          });
          this.$store.commit("SET_STREAMLAYER_OBJECT", this.streamLayerGroup);//在getdatashowcontrol组件中相应更改
          break;
        case 'HLULayer':
          featureCollection.eachLayer(layer => {
            this.HLULayerGroup.addLayer(layer);
          });
          this.$store.commit("SET_HLULAYER_OBJECT", this.HLULayerGroup);//在getdatashowcontrol组件中相应更改
          break;
      }
    },
    removeBasinLayer() {
      console.log('Select local data, remove basin layer');
      try {
        this.basinLayer.remove();
      } catch { }
    },
    basinScopeSelectSystemReselect() {
      this.drawingBasinLayerGroup.clearLayers();
      //改指针
      eventBus.$emit("change-cursor");

      this.riverShowTemp = false;

      //更新store
      this.$store.commit("SET_BASINBOUNDLAYER_OBJECT", null);
      this.$store.commit("SET_BASINOUTLETLAYER_OBJECT", null);

      //更新图层状态
      this.$emit("changeLayerStatus", "basinbound", false)
      this.$emit("changeLayerStatus", "basinoutlet", false)

      this.basinScopeSelectSystem = false;
    },
    
    streamNetValueCommit() {
      // this.completeStreamNetValueCommit = true;
      this.StreamNetValueCommitLoading = true;
      let params = new URLSearchParams();
      params.append("projectName", this.projectName);
      params.append("streamNetValue", this.formStreamNetworkValue.streamValueCell);
      request.post('/basins/preprocess/streamNetworkValue', params)
        .then(res => {
          this.StreamNetValueCommitLoading = false;
          if (res.data.errCode == 200) {
            this.$Notice.success({
              title: '河网阈值设置成功，生成流域划分结果',
              duration: 10
            })
            this.completeStreamNetValueCommit = true;
          } else {
            this.$Notice.warning({
              title: '河网阈值设置失败，请重新设置！',
              desc: '失败原因： ' + res.data.msg,
              duration: 10
            });
          }
        }).catch(e => {
          this.$Notice.error({
            title: '河网阈值设置失败，请重新设置！',
          });
        })
      // this.handleSubmitProject('formStreamNetworkValue')
    },
    uploadSuccess(res, file) {
      if (res.errCode == 200) {
        this.$Notice.success({
          title: '文件上传成功',
          duration: 10
        })
      } else {
        this.$Notice.warning({
          title: '文件上传失败',
          desc: '失败原因： ' + res.msg,
          duration: 10
        });
      }
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: file.name + '的文件格式不对，请重新选择文件进行上传。',
        duration: 10
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: '超过文件大小限制',
        desc: '文件  ' + file.name + ' 超过100MB.'
      });
    },
    handleBeforeUpload(file) {
      this.uploadList.push(file);
      const FileExt = file.name.replace(/.+\./, "");//取得文件的后缀名
      const check = this.uploadList.length <= this.outletMaxLength;
      if (!check) {
        this.$Notice.warning({
          title: '最多只能上传' + this.outletMaxLength + '个文件.',
          duration: 10
        });
      } else if (['shp', 'shx', 'dbf', 'prj'].indexOf(FileExt.toLowerCase()) === -1) { //
        this.$Notice.error({ title: '请上传以shp,shx,dbf,prj结尾的文件', duration: 10 });
        var index = this.uploadList.indexOf(file.name);
        this.uploadList.splice(index, 1);
      } else if (file.size > 102400) {
        this.$Notice.warning({
          title: '超过文件大小限制',
          desc: '文件  ' + file.name + ' 超过100MB.',
          duration: 10
        });
        var index = this.uploadList.indexOf(file.name);
        this.uploadList.splice(index, 1);
      }
      return false;
    },
    upload() {
      this.loadingStatus = true;
      let requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      }
      for (let i = 0; i < this.uploadList.length; i++) {
        let fileFormData = new FormData();
        fileFormData.append('file', this.uploadList[i]);
        request
          .post('/file/upload', fileFormData, requestConfig)
          .then(res => {
            if (res.data.errCode == 200) {
              this.$Notice.success({
                title: this.uploadList[i].name + '上传成功',
                duration: 10
              })
            } else {
              this.$Notice.warning({
                title: this.uploadList[i].name + '上传失败',
                desc: '失败原因： ' + res.data.msg,
                duration: 10
              });
            }
          }).catch(e => {
            this.$Notice.error({
              title: this.uploadList[i].name + '上传失败'
            });
          })
      }
      window.setTimeout(() => {
        this.loadingStatus = false;
      }, 3000);
    },
    
    downloadFile() {
      const url = 'http://localhost:8888/static/subbasinLandUse.csv'; // 替换为后端提供下载静态文件的接口地址
      // 创建一个 <a> 标签
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.target = '_blank'; // 在新标签页中打开下载链接

      // 模拟点击下载链接
      downloadLink.click();
    },
    geoserverPublih() {
      var paramObj = {
        fileName: "D:/WEB/basins/test/test7/workspace/spatial_raster/dem.tif",
        workSpace: this.projectName,
        styleName: "dem",
        dataSetName: "dem",
        layerName: "dem",
        dataType: 2,
        crs: 4326
      };
      var options = {
        headers: {
          "content-type": "application/json"
        },
        method: "POST",
        data: JSON.stringify(paramObj)
      };
      request('/geoserver/publish', options)
        .then(res => {
          // console.log(res);
          if (res.data.errCode == 200) {
            console.log("gerosrver publish success");
          } else {
            console.log("gerosrver publish failed");
          }
        }).catch(e => {
          console.log("gerosrver publish failed");
        })
    },
    handleBeforeObservedUpload(file) {
      this.observedUploadList.push(file);
      const FileExt = file.name.replace(/.+\./, "");//取得文件的后缀名
      const check = this.observedUploadList.length <= 20;
      if (!check) {
        this.$Notice.warning({
          title: '最多只能上传20个文件.',
          duration: 10
        });
      } else if (['csv'].indexOf(FileExt.toLowerCase()) === -1) { //
        this.$Notice.error({ title: '请上传以csv结尾的文件', duration: 10 });
        var index = this.observedUploadList.indexOf(file.name);
        this.observedUploadList.splice(index, 1);
      } else if (file.size > 102400) {
        this.$Notice.warning({
          title: '超过文件大小限制',
          desc: '文件  ' + file.name + ' 超过100MB.',
          duration: 10
        });
        var index = this.observedUploadList.indexOf(file.name);
        this.observedUploadList.splice(index, 1);
      }
      return false;
    },
    observedUpload() {
      this.observedLoadingStatus = true;
      let requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      }
      let formData = new FormData();
      for (let i = 0; i < this.observedUploadList.length; i++) {
        formData.append('file', this.observedUploadList[i]);
      }
      formData.append('projectName', this.projectName);
      request
        .post('/file/observedUpload', formData, requestConfig)
        .then(res => {
          if (res.data.errCode == 200) {
            this.$Notice.success({
              title: '观测数据文件上传成功',
              duration: 10
            })
          } else {
            this.$Notice.warning({
              title: '观测数据文件上传失败',
              desc: '失败原因： ' + res.data.msg,
              duration: 10
            });
          }
        }).catch(e => {
          this.$Notice.error({
            title: '观测数据文件上传失败'
          });
        })

      window.setTimeout(() => {
        this.observedLoadingStatus = false;
      }, 3000);
    },
    outletUploadClose(event, name) {
      for (var i = this.observedUploadList.length - 1; i >= 0; i--) {
        if (this.observedUploadList[i].name == name) {
          this.observedUploadList.splice(i, 1);
        }
      }
    },
    downloadObserverdExample() {
      this.downloadObserverdExampleLoadingStatus = true;
      request.get("/file/downloadObservedExample", {
        responseType: 'blob'
      },
      )
        .then(res => {
          var fileName = "ObserverdExample.zip";
          var fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
          var fileLink = document.createElement('a');
          fileLink.href = fileURL;
          fileLink.setAttribute('download', fileName);
          document.body.appendChild(fileLink);
          fileLink.click();
          // 下载完成移除元素
          // document.body.removeChild(a);
          // 释放掉blob对象
          window.URL.revokeObjectURL(fileURL);
        })
        .catch(e => {
          this.$Notice.error('下载观测数据示例文件失败');
        })
      window.setTimeout(() => {
        this.downloadObserverdExampleLoadingStatus = false;
      }, 3000);
    },
    observedPreprocess() {
      this.observedPreprocessStatus = 'modelRunning';
      window.setTimeout(() => {
        this.observedPreprocessStatus = 'modelRunSuccessed';
      }, 3000);
    },
    ///
    saveProjectPreprocess() {
      if (this.createProjectStatus == 'modelRunSuccessed' && this.subbasinDelineationStatus == 'modelRunSuccessed' && this.simulationUnitDelineationStatus == 'modelRunSuccessed'
        && this.climatePreprocessStatus == 'modelRunSuccessed' && this.observedPreprocessStatus == 'modelRunSuccessed') {
        this.showProjectDetail()
        this.preprocessToMongoDB = true;
      } else {
        this.$Notice.warning({
          title: '建模预处理未完成，请重新设置！',
          duration: 10
        });
      }
    },
    showProjectDetail() {
      if (this.basinScopeType == 'basinScopeFromSystem') {
        this.basinScopeTypeDes = '使用系统提供流域范围'
      } else if (this.basinScopeType == 'basinScopeFromLocal') {
        this.basinScopeTypeDes = '使用本地上传的流域范围'
      };
      if (this.outletType == 'outletFromSystemMapDraw') {
        this.outletTypeDes = '在地图页面绘制生成'
      } else if (this.outletType == 'outletFromLocal') {
        this.outletTypeDes = '由本地上传'
      };
      if (this.soilMapDataType == 'soilMapFromSystem') {
        this.soilMapDataTypeDes = this.getDictValue(this.soilMapList, this.soilMapSelect)
        this.soilParaDataTypeDes = this.getDictValue(this.soilParaList, this.soilParaSelect)
      } else if (this.soilMapDataType == 'soilMapFromLocal') {
        this.soilMapDataTypeDes = '由本地上传'
        this.soilParaDataTypeDes = '由本地上传'
      };
      if (this.landuseDataType == 'landuseFromSystem') {
        this.landuseDataTypeDes = this.getDictValue(this.landuseMapList, this.landuseMapSelect)
      } else if (this.landuseDataType == 'landuseFromLocal') {
        this.landuseDataTypeDes = '由本地上传'
      };
      if (this.rainDataType == 'rainFromSystem') {
        this.rainDataTypeDes = this.getDictValue(this.rainDataList, this.rainDataSelect)
      } else if (this.rainDataType == 'rainFromLocal') {
        this.rainDataTypeDes = '由本地上传'
      };
      if (this.meteoDataType == 'meteoFromSystem') {
        this.meteoDataTypeDes = this.getDictValue(this.meteoDataList, this.meteoDataSelect)
      } else if (this.meteoDataType == 'meteoFromLocal') {
        this.meteoDataTypeDes = '由本地上传'
      };
    },
    getDictValue(jsObjects, selectValue) {
      var result = jsObjects.filter(x => x.value === selectValue);
      return result[0].label
    },
    submitProjectDetail() {
      this.submitProjectDetailStatus = true;
      let params = new URLSearchParams();
      params.append("projectName", this.projectName);
      request.post('/SEIMSDataProcessing/dbBuildMongodb', params)
        .then(res => {
          if (res.data === true) {
            this.$Notice.success({
              title: '建模预处理数据已保存',
              duration: 10
            })
            this.submitProjectDetailStatus = false;
            this.preprocessToMongoDB = false;
            this.riverShowTemp = false;
            // this.geoserverPublih();
          } else {
            this.$Notice.warning({
              title: '建模预处理数据保存失败，请重新设置！',
              desc: '失败原因： ' + res.data.msg,
              duration: 10
            });
            this.submitProjectDetailStatus = false;
          }
        }).catch(e => {
          this.$Notice.error({
            title: '建模预处理数据保存失败，请重新设置！',
          });
          this.submitProjectDetailStatus = false;
        })
    },
    dropProjectDetail() {
      this.preprocessToMongoDB = false;
    },

    transformDecimal(number, i) {
      let decimalNum = null;
      // 先转换为数值型
      let num = Number(number);
      // 判断是否为数值型
      if (!isNaN(num)) {
        // 切分整数与小数
        let arr = num.toString().split(".");
        // 是小数且小数位大于保留个数
        if (arr.length > 1 && arr[1].length > i) {
          // 小数部分字符串
          let decimal = arr[1].slice(i, i + 1);
          // toFixed 有 bug，四舍六入五随机
          // 当四舍五入的数为 5，给其 + 1
          if (decimal === '5') {
            // 这里可能会存在 0.1 ** 5 = 0.000010000000000000003 但不影响四舍五入
            num += Math.pow(0.1, i + 1);
          }
          decimalNum = num.toFixed(i);
        }
        else {
          decimalNum = num;
        }
        decimalNum = Number(decimalNum);
      }
      return String(decimalNum);
    },
    convertCellArea(type) {
      var streamValueArea = this.formStreamNetworkValue.streamValueArea;
      var streamValueCell = this.formStreamNetworkValue.streamValueCell;
      if (type == 'cell') {
        var valueAreaTmp = streamValueCell * Math.pow(this.DEMDataSize, 2) * 0.000001
        this.formStreamNetworkValue.streamValueArea = this.transformDecimal(valueAreaTmp, 4)
      } else if (type == 'area') {
        var valueCellTmp = (streamValueArea * 1000000) / Math.pow(this.DEMDataSize, 2);
        this.formStreamNetworkValue.streamValueCell = this.transformDecimal(valueCellTmp, 0)
      }
    },
    handleCloseObs(event, name) {
      const index = this.obsDataTypeSelect.indexOf(name);
      this.obsDataTypeSelect.splice(index, 1);
    },
    obsDataTypeLocalSubmit() {
      var obsName = this.obsDataTypeLocal.name;
      // console.log(obsName);
      // console.log(this.getBLen(obsName));
      // console.log(this.obsDataTypeSelect.indexOf(obsName));

      //可以分次添加多个观测数据类型
      if (this.getBLen(obsName) && this.obsDataTypeSelect.indexOf(obsName) < 0) {
        this.obsDataTypeSelect.push(obsName);
      }
    },
    addObsDataTypeSelectSystem(val) {
      if (val in this.obsDataTypeSelect) {

      } else {
        this.obsDataTypeSelect.push(val);
      }

    },
    getBLen(str) {
      if (str == null) return 0;
      if (typeof str != "string") {
        str += "";
      }
      return str.replace(/[^\x00-\xff]/g, "01").length;
    },
    obsSelectShow(obsName) {
      if (this.obsDataResource.indexOf(obsName) < 0) {
        return true
      } else {
        return false
      }
    },
    dateFormat(fmt, date) {
      let ret;
      const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };
      for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
      };
      return fmt;
    },
    remove(index) {
      this.POIdata.splice(index, 1);
      this.POILayers.clearLayers();
      var arr = this.POIdata;
      for (var i = 0; i < arr.length; i++) {
        // console.log(arr[i]);
        var lat = arr[i].lat;
        var lon = arr[i].lon;
        //创建marker

        // var layer = L.marker([lat, lon], {
        //   icon: new L.Icon({
        //     className: "rivermap-icon",
        //     iconUrl: require('../../assets/subBasinOutlet.png'),
        //     iconSize: [24, 24],
        //     iconAnchor: [12, 24],
        //   })
        // }).addTo(this.POILayers)//添加到图层
        let marker = L.marker(new L.LatLng(lat, lon), { // 创建点
        }).addTo(this.POILayers)//添加到图层
      }
    },
    uploadfactor() {
      console.log(this.typeSelect)
    },
    typeSelectChange() {
      this.uploaddata['tiftype'] = this.typeSelect
    },
    init() {
      this.mapCM = this.$store.getters.storeMap,
      this.tempStreamLayerGroup = L.layerGroup([]);
      this.tempStreamLayerGroup.addTo(this.mapCM);
    },
    beforeUpload1(file, index){
      console.log(index)
      this.uploaddata['tiftype'] = this.tabledata1[index].Factor
      console.log(this.uploaddata['tiftype'])
      this.filename = file.name
      console.log(this.filename)
    },
    beforeUpload(file, index){
      console.log(index)
      this.uploaddata['tiftype'] = this.tabledata[index].Factor
      console.log(this.uploaddata['tiftype'])
      this.filename = file.name
      console.log(this.filename)
    },
    updatesuccess1(index){
      var _this = this;
      console.log(this.tabledata1[index].Factor)
      this.sourcedata1[this.tabledata1[index].Factor].push(this.filename)
      //执行burn-in
      let params = new URLSearchParams();
      params.append("projectName", this.projectName);
      params.append("username", this.username);
      params.append("threshold", "");
      request
        .post('/basins/BurnIn', params)
        .then(res => {
          if (res.data) {
            this.$Message.success({
              content: 'BURN-IN成功！',
              duration: 3
            });
            _this.addGeoJSONToMap('streamLayer', JSON.stringify(res.data), "blue");
          } else {
            this.$Message.error({
              content: 'BURN-IN失败！',
              duration: 3,
            });
          }
        })
        .catch(e => {
          console.log(e)
          this.$Message.error('BURN-IN失败！');
        });
    },
    updatesuccess(index){
      console.log(this.tabledata[index].Factor)
      this.sourcedata[this.tabledata[index].Factor].push(this.filename)
    },
    selectChange1(value, index){
      console.log(value)
      this.sourceSelectdata['dem'] = value
      console.log(this.sourceSelectdata)
    },
    selectChange(value, index){
      console.log(value)
      this.sourceSelectdata[this.tabledata[index].Factor] = value
      console.log(this.sourceSelectdata)
    },
    handleSelect(selection, row) {
      // selection 是已选项目数据数组
      // row 是当前选中的数据对象
      console.log(selection)
      // this.selecttabledata = selection;
      this.TypeList=['Elevation','Slope','Area']
      for (let Factor of selection) {
        this.TypeList.push(Factor.Factor)
      }
      console.log(this.TypeList)
    },
    onProgress() {
      this.tableLoading = true
    },
    inidata(response, file, fileList) {
      console.log(fileList)
      this.POIdata = this.POIdata.concat(response)
      console.log(this.POIdata)
      if(this.pointSelect == "") this.pointSelect = 1;

      this.filename = fileList[0].name
      this.tableLoading = false
      //初始化图表.this.data的监听中执行
      // this.radius_tableData_Change();
      //地图添加POI标记
      this.addPOIMarker();
      // this.initChart()
    },
    addPOIMarker() {
      var arr = this.POIdata;
      for (var i = 0; i < arr.length; i++) {
          // console.log(arr[i]);
          var lat = arr[i].lat;
          var lon = arr[i].lon;
          //创建marker
          let marker = L.marker(new L.LatLng(lat, lon), { // 创建点
          }).addTo(this.POILayers)//添加到图层
      }
    },

    locate(index) {
      var lat = this.POIdata[index].lat;
      var lon = this.POIdata[index].lon;
      this.mapCM.flyTo(new L.LatLng(lat, lon), 8)

      // 请求后端查看流域范围
      if(this.basinRespons & this.complte_watershedList[index] != 1) {
        this.$Notice.info({
          name: 'pollBasin',
          title: '流域范围拉取中...',
        });


        let pointdata = JSON.stringify(this.POIdata[index])
        let params1 = new URLSearchParams();
        params1.append("basinType", this.basinType);
        var DEMsourcetype = "1"
        if (this.sourceSelectdata['dem'] != this.globalsourcedata['dem']) {
          DEMsourcetype = "2"
        }
        params1.append("DEMsourcetype", DEMsourcetype);
        params1.append("radius", this.radius);
        params1.append("pointdata", pointdata);
        params1.append("projectName", this.projectName);
        params1.append("username", sessionStorage.getItem('username'));
        
        // 一次请求一个流域 实时返回范围
        request
        .post('/file/generateWatershed', params1)
        .then(res => {
            if (res != null) {
              this.complte_watershedList[index] = 1
              console.log(res.data)
              console.log("渲染")
              for (var json of res.data) {
                this.addGeoJSONToMap('basinLayer', JSON.stringify(json), "red");
              }
              this.$Notice.close('pollBasin')
              this.$Notice.success({
                title: '流域范围拉取成功！',
              });
            }
        })
        .catch(e => {
            console.log(e)
            console.log('流域范围拉取失败！')
            this.$Message.error('流域提取失败！');
        });
      }
    },

    viewTable(){
      this.staticDataModal = true
      var _this = this
      console.log(this.basinRespons)
      console.log(this.polldataState)
      // 当流域范围提取完成且没有拉取过数据  才进行拉取
      if (this.basinRespons && this.polldataState == false) {
        this.tableloading2 = true
        this.polldataState = true
        console.log(this.TypeList)
        console.log(this.complteAttributes)

        // 轮询，没有完全拉取数据回来，就每5秒拉取计算结果
        const pollData = setInterval(() => {
          if(!this.complteAttributes){
            for (let [index, type] of this.TypeList.entries()) {
              // 数值型
              if (type == "Glacier" || type == "Permafrost" || type == "Climate" || type == "Human Footprint 2009" || type == "Total GDP 2015" || type == "Per Capita GDP 2015" || type == "HDI 2009" || type == "Nighttime Lights 2013" || type == "Road Density" || type == "Elevation" || type == "Slope" || type == "Area" || type == "NDVI" ||  type == "Porosity" ||  type == "LAI" ||  type == "EVI" ||  type == "ET" ||  type == "NPP" || type == "GPP" ||  type == "Subsurface Permeability" || type == "Population Count"|| type == "Population Density" || type == "Soil Properties") {
                  // 已经拉取过的数据不继续请求后端拉取
                  if (this.complte_TypeList[index] == 1 && this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata)  && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
                      console.log(this.data)
                  }
                  else{
                      console.log(type)
                      console.log("请求后端拉取计算结果")
                      this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));
                      let current_type = type
                      let polling = new FormData();
                      polling.append("projectname", this.projectName);
                      polling.append("username", sessionStorage.getItem('username'));
                      polling.append('filepathandname',"data_prepare/spatial/" + type + "Static.txt") //生成的最后一个文件是txt文件，以此作为结束的标志
                      request.post("/Polling", polling)
                        .then(res=>{
                          console.log(type)
                          console.log(res.data.errCode);
                          console.log(res.data);
                          if (res.data.errCode == 200) {
                            this.basinRespons = true
                            _this.$Notice.success({
                              title: current_type + ' extraction completed!',
                              duration: 3
                            });
                            console.log(res.data)
                            this.textDatas[type] = res.data.data
                            this.textData[type] = res.data.data[this.pointSelect - 1]
                            this.pointList = new Array(this.POIdata.length).fill(1).map((v, i) => ++i);
                            this.oldPOIdata = [...this.POIdata]
                            this.oldTypeList = [...this.TypeList]
                            this.oldradius = this.radius

                            // 对于一个type中有多个子变量：后端直接把所有变量严格key返回
                            if (type == "Soil Properties" || type == "Climate" || type == "Permafrost" || type == "Glacier"){
                              var i = 1
                              // 土壤分层属性
                              for (const a_textData of this.textDatas[type]){
                                this.textData[type] = a_textData
                                for (let key in this.textData[type]) {
                                  console.log(this.textData[type][key]);
                                  // 判断是否已经有这个id的属性记录
                                  let exists = this.data_f.some(obj => obj.ID === i);
                                  console.log(exists)
                                  if(exists){
                                    this.data_f[i - 1][key] = this.textData[type][key]
                                  }
                                  else{
                                    this.data_f.push({
                                      key: i,
                                      ID: i,
                                      [key]: this.textData[type][key],
                                    });
                                  }
                                }
                                i += 1
                              }
                              
                            }
                            // 对于单一变量不需要最值和均值
                            else if(type == "Area"){
                              var i = 1
                              for (const textData of this.textDatas[type]) {
                                console.log(textData);
                                // 判断是否已经有这个id的属性记录
                                let exists = this.data_f.some(obj => obj.ID === i);
                                console.log(exists)
                                if(exists){
                                  this.data_f[i - 1]['Area'] = textData[0].value
                                }
                                else{
                                  this.data_f.push({
                                    key: i,
                                    ID: i,
                                    Area: textData[0].value,
                                  });
                                }
                                i += 1
                              }
                            }
                            // 需要计算总和的
                            else if(type == "Total GDP 2015" || type == "Human Footprint 2009" || type == "Nighttime Lights 2013" || type == "Population Count"){
                              console.log("Total_GDP")
                              var i = 1
                              const max = type + "_max"
                              const min = type + "_min"
                              const mean = type + "_mean"
                              const sum = type + "_sum"
                              for (const textData of this.textDatas[type]) {
                                console.log(textData);
                                console.log(this.data_f)
                                // 判断是否已经有这个id的属性记录
                                let exists = this.data_f.some(obj => obj.ID === i);
                                console.log(exists)
                                if(exists){
                                  this.data_f[i - 1][max] = textData.max
                                  this.data_f[i - 1][min] = textData.min
                                  this.data_f[i - 1][mean] = textData.mean
                                  this.data_f[i - 1][sum] = textData.sum
                                }
                                else{
                                  this.data_f.push({
                                    key: i,
                                    ID: i,
                                    [max]: textData.max,
                                    [min]: textData.min,
                                    [mean]: textData.mean,
                                    [sum]: textData.sum,
                                  });
                                }
                                i += 1
                              }

                              console.log()
                            }
                            else{
                              var i = 1
                              const max = type + "_max"
                              const min = type + "_min"
                              const mean = type + "_mean"
                              const sum = type + "_sum"
                              for (const textData of this.textDatas[type]) {
                                console.log(textData);
                                console.log(this.data_f)
                                // 判断是否已经有这个id的属性记录
                                let exists = this.data_f.some(obj => obj.ID === i);
                                console.log(exists)
                                if(exists){
                                  this.data_f[i - 1][max] = textData.max
                                  this.data_f[i - 1][min] = textData.min
                                  this.data_f[i - 1][mean] = textData.mean
                                }
                                else{
                                  this.data_f.push({
                                    key: i,
                                    ID: i,
                                    [max]: textData.max,
                                    [min]: textData.min,
                                    [mean]: textData.mean,
                                  });
                                }
                                i += 1
                              }
                            }
                            
                            this.disabled = false;
                            this.loading = false;    
                          
                            this.complte_TypeList[index] = 1

                            if (this.complte_TypeList.every(element => element === 1)) {
                              // 清楚计时器
                              clearInterval(pollData);
                            }
                          }else if(res.data.errCode == 204){
                            _this.$Notice.close('static')
                            this.$Notice.info({
                              name: 'static',
                              title: "流域环境因子提取未完成！",
                              duration: 0,
                            });
                          }else {
                            _this.$Notice.close('static')
                            this.$Notice.error({
                              title: "流域环境因子提取失败！",
                              duration: 0,
                            });
                          }
                        })
                        .catch(err=>{
                          console.log(err);
                          _this.$Notice.close('static')
                          this.$Notice.error({
                              title: "流域环境因子提取失败！！",
                              duration: 0,
                            });
                        });
                  }
              }
              //类型
              else {
                  console.log("类型") 
                  if (this.complte_TypeList[index] == 1 && this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata) && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
                      console.log(this.data)
                  }
                  else{
                      console.log("请求后端拉取计算结果")
                      this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));

                      let polling = new FormData();
                      polling.append("projectname", this.projectName);
                      polling.append("username", sessionStorage.getItem('username'));
                      polling.append('filepathandname',"data_prepare/spatial/" + type + "Static.txt") //生成的最后一个文件是txt文件，以此作为结束的标志
                      request.post("/Polling", polling)
                        .then(res=>{
                          // console.log(res.data.errCode);
                          if (res.data.errCode == 200) {
                            _this.$Notice.success({
                              title: type + ' extraction completed!',
                              duration: 0
                            });
                            console.log(res.data.data)
                            this.chartDatas[type] = res.data.data
                            this.chartData[type] = res.data.data[this.pointSelect - 1]
                            this.pointList = new Array(this.POIdata.length).fill(1).map((v, i) => ++i);
                            this.oldPOIdata = [...this.POIdata]
                            this.oldTypeList = [...this.TypeList]
                            this.oldradius = this.radius

                            
                            var i = 1
                            for (const chartData of this.chartDatas[type]) {
                              console.log(chartData);

                              let exists = this.data_f.some(obj => obj.ID === i);
                              console.log(exists)
                              if(exists){
                                for (const name_value of chartData) {
                                  this.data_f[i - 1][name_value.name] = name_value.value
                                }
                              }
                              else{
                                const id_data = { 
                                  key: i,
                                  ID: i
                                }
                                const values = {}
                                for (const name_value of chartData) {
                                  values[name_value.name] = name_value.value
                                }
                                const merged = Object.assign({}, id_data, values);
                                this.data_f.push(merged);
                              }
                              // 将空的类型的值赋值为0
                              const haveValueType = chartData.map(obj => obj['name']);
                              console.log(haveValueType)
                              const allType = this.variables[type].map(obj => obj['key']);
                              console.log(allType)
                              const difference = allType.filter(element => haveValueType.indexOf(element) === -1);
                              for (const name of difference) {
                                this.data_f[i - 1][name] = 0
                              }

                              i += 1
                            }

                            this.complte_TypeList[index] = 1

                            if (this.complte_TypeList.every(element => element === 1)) {
                              // 清楚计时器
                              clearInterval(pollData);
                            }
                          }else if(res.data.errCode == 204){
                            this.$Notice.close('static')
                            this.$Notice.info({
                              title: "流域环境因子提取未完成！",
                              duration: 0,
                            });
                          }else {
                            this.$Notice.close('static')
                            this.$Notice.error({
                              title: "流域环境因子提取失败！",
                              duration: 0,
                            });
                          }
                        })
                        .catch(err=>{
                          console.log(err);
                          this.$Notice.close('static')
                          this.$Notice.error({
                              title: "流域环境因子提取失败！！",
                              duration: 0,
                          });
                        });
                  }
              }
            }
          }
        }, 5000); 
        
        // 轮询，数据完全拉取回来才渲染到表格中
        if(!this.complteAttributes){
          const pollData1 = setInterval(() => {
            // 当所有属性都提取完成，才渲染表单
            if (this.complte_TypeList.every(element => element === 1)) {
              this.complteAttributes = true
              this.$Notice.close('static')
              _this.$Notice.success({
                  title: 'watershed attributes extraction completed!',
                  duration: 0,
              });
              // 清楚计时器
              clearInterval(pollData1);
              _this.data = [] // 避免重复录入
              this.data_f.forEach(function(a_data) {
                _this.data.push(a_data)
              }); 
              this.tableloading2 = false
            }
          }, 1000); 
        }
        
        console.log(this.data)
      }
      else if(!this.basinRespons){
        _this.$Notice.info({
          name: 'static',
          title: '正在提取流域，请稍候！',
          duration: 0
        });
      }else{

      }

    },

    static(){
      var radiusType = 1
      if( (this.clickEuRadius || this.clickFpRadius) ){
        if (this.clickEuRadius) {
          // 欧式距离
          radiusType = 1
        } else {
          // 流向距离
          radiusType = 2
        }
      }
      else{
        this.radius = "all"
      }

      this.basinRespons = false
      this.polldataState = false
      this.complteAttributes = false
      this.complte_TypeList = this.TypeList.map(() => 0);
      this.complte_watershedList = this.POIdata.map(() => 0);

      console.log(this.sourceSelectdata)
      
      //JSON数组转字符串
      var dataStr = JSON.stringify(this.POIdata);
      console.log(dataStr);

      var _this = this;

      // console.log("------------------------------")
      // console.log(JSON.stringify(this.oldPOIdata) !== JSON.stringify(this.POIdata))
      // console.log(JSON.stringify(this.sourceSelectdata) !== JSON.stringify(this.old_sourceSelectdata))
      // console.log(this.oldradius != this.radius)
      // console.log(JSON.stringify(this.oldPOIdata))
      // console.log(JSON.stringify(this.POIdata))
      // console.log(JSON.stringify(this.sourceSelectdata))
      // console.log(JSON.stringify(this.old_sourceSelectdata))
      // console.log(this.oldradius)
      // console.log(this.radius)
      // console.log("------------------------------")

      //生成流域范围，并渲染
      if (JSON.stringify(this.oldPOIdata) !== JSON.stringify(this.POIdata) || JSON.stringify(this.sourceSelectdata) !== JSON.stringify(this.old_sourceSelectdata) || this.oldradius != this.radius){
        // this.$Spin.show({
        //   render: (h) => {
        //     return h('div', [
        //       h('Icon', {
        //         'class': 'demo-spin-icon-load',
        //         props: {
        //           type: 'ios-loading',
        //           size: 18
        //         }
        //       }),
        //       h('div', 'Obtaining watershed extent')
        //     ])
        //   }
        // });
        _this.$Notice.info({
            name: 'basin',
            title: 'Extracting watershed, please wait!',
            duration: 0
        });
        var successNum = 0

        this.data = []
        // columns初始化
        const columns = [
          {
            title: 'ID',
            key: 'ID',
            align: 'center',
            width: 50,
            fixed: 'left',
            sortable: true
          },
          {
            title: 'Topographical',
            align: 'center',
            children: this.Topographical
          },
        ];
        this.columns = columns


        console.log(this.POIdata);
        let params1 = new URLSearchParams();
        params1.append("basinType", this.basinType);
        var DEMsourcetype = "1"
        if (this.sourceSelectdata['dem'] != this.globalsourcedata['dem']) {
          DEMsourcetype = "2"
        }
        var dataStr = JSON.stringify(this.POIdata);
        

        params1.append("DEMsourcetype", DEMsourcetype);
        params1.append("radiusType", radiusType);
        params1.append("radius", this.radius);
        params1.append("pointdata", dataStr);
        params1.append("projectName", this.projectName);
        params1.append("username", sessionStorage.getItem('username'));

        const paramsObj = Object.fromEntries(params1.entries());
        console.log(paramsObj);
        // 一次请求所有个流域 不返回范围，在轮询时选择是否返回
        request.post('/file/generateWatersheds', params1)
      }
      // 若流域已经提取完成
      else{
        this.basinRespons = true
        // this.staticDataModal = true
        this.$Notice.close('basin')
      }

      // 轮询。每5秒更新请求一次
      console.log("轮询流域提取状态")
      var _this = this
      var timer1 = window.setInterval(() => {
        setTimeout( () =>{
          var polling = new FormData();
          var len = _this.POIdata.length
          var lon = _this.POIdata[len - 1].lon
          var lat = _this.POIdata[len - 1].lat
          console.log(lon)
          console.log(lat)
          var lastprojectname = _this.projectName + "_" + lon + lat;
          console.log(lastprojectname)
          polling.append("projectname", lastprojectname);
          polling.append("username", sessionStorage.getItem('username'));
          polling.append('filepathandname',"data_prepare/spatial/basin_buffer_" + _this.radius + ".tif") //生成的最后一个文件是最后一个点的流域范围tif，以此作为子流域划分结束的标志
          request.post("/Polling", polling)
            .then(res=>{
              console.log(res.data.errCode);
              if (res.data.errCode == 200) {
                // 清除定时器
                clearInterval(timer1)
                _this.basinRespons = true
                _this.$Notice.close('basin')
                _this.$Notice.success({
                    title: 'Watershed extraction successful!',
                    duration: 0
                });
                //添加流域范围图层
                // _this.addGeoJSONToMap('subBasinLayer', JSON.stringify(res.data.data[0]), "red");
                // _this.addGeoJSONToMap('streamLayer', JSON.stringify(res.data.data[1]), "blue");
              }else if(res.data.errCode == 204){
                // 继续轮询
                console.log("继续轮询")
              }else {
                // 清除定时器
                clearInterval(timer1)
                this.$Notice.success({
                  title: "流域提取失败！",
                  duration: 0,
                });
              }
            })
            .catch(err=>{
              console.log(err);
              confirm('流域提取失败！!');
              // 清除定时器
              clearInterval(timer1)
            });
        }, 0);
      }, 5000);
      
      // // 原环境因子轮询算法
      // const pollData = setInterval(() => {
      //   // 如果data有值了，就清除定时器
      //   if (this.basinRespons) {

      //     _this.$Notice.info({
      //       name: 'static',
      //       title: '正在提取流域环境因子，请稍候！',
      //       duration: 0
      //     });

      //     //设置没被选中的type的图表div不显示
      //     // const notInObjKeys = this.TypeList.filter(value => !Object.keys(this.sourcedata).includes(value));
      //     const notInObjKeys = Object.keys(this.sourcedata).filter(key => !this.TypeList.includes(key));
      //     console.log("$$$$$$$$$$$$$$$$")
      //     console.log(notInObjKeys)
      //     // 不显示不展示的环境因子图表
      //     for(let notintype of notInObjKeys) {
      //       let chartdiv
      //       switch (notintype) {  
      //         case "Elevation":
      //           console.log("Elevation")
      //           chartdiv = 'elevationChartdiv'
      //           break;  
      //         case "NDVI":
      //           console.log("NDVI")
      //           chartdiv = 'NDVIChartdiv'
      //           break;  
      //         case "Landuse":
      //           console.log("Landuse")
      //           chartdiv = 'landuseChartdiv'
      //           break;   
      //         case "Soil":
      //           console.log("Soil")
      //           chartdiv = 'soilChartdiv'
      //           break;  
      //         case "Geological":
      //           console.log("Geological")
      //           chartdiv = 'geologicalChartdiv'
      //           break;  
      //         case "Porosity":
      //           console.log("Porosity")
      //           chartdiv = 'porosityChartdiv'
      //           break;    
      //         case "Subsurface Permeability":
      //           console.log("Subsurface Permeability")
      //           chartdiv = 'subsurfacePermeabilityChartdiv'
      //           break;    
      //         case "LAI":
      //           console.log("LAI")
      //           chartdiv = 'LAIChartdiv'
      //           break;    
      //         case "ET":
      //           console.log("ET")
      //           chartdiv = 'ETChartdiv'
      //           break;    
      //         case "EVI":
      //           console.log("EVI")
      //           chartdiv = 'EVIChartdiv'
      //           break;    
      //         case "NPP":
      //           console.log("NPP")
      //           chartdiv = 'NPPChartdiv'
      //           break;    
      //         case "Population Count":
      //           console.log("Population Count")
      //           chartdiv = 'populationCountChartdiv'
      //           break;    
      //         case "Population Density":
      //           console.log("Population Density")
      //           chartdiv = 'populationDensityChartdiv'
      //           break;    
      //       }
      //       let div = document.getElementById(chartdiv);
      //       div.style.display = 'none'; // 不显示，且不占据空间
      //     }
      //     console.log(this.TypeList)
      //     // 显示要展示的环境因子图表，并请求后端计算环境因子
      //     for (let type of this.TypeList) {
      //       let chartdiv;
      //       switch (type) {  
      //         case "Elevation":
      //           console.log("Elevation")
      //           chartdiv = 'elevationChartdiv'
      //           break;  
      //         case "NDVI":
      //           console.log("NDVI")
      //           chartdiv = 'NDVIChartdiv'
      //           break;  
      //         case "Landuse":
      //           console.log("Landuse")
      //           chartdiv = 'landuseChartdiv'
      //           break;   
      //         case "Soil":
      //           console.log("Soil")
      //           chartdiv = 'soilChartdiv'
      //           break;  
      //         case "Geological":
      //           console.log("Geological")
      //           chartdiv = 'geologicalChartdiv'
      //           break;  
      //         case "Porosity":
      //           console.log("Porosity")
      //           chartdiv = 'porosityChartdiv'
      //           break;    
      //         case "Subsurface Permeability":
      //           console.log("Subsurface Permeability")
      //           chartdiv = 'subsurfacePermeabilityChartdiv'
      //           break;    
      //         case "LAI":
      //           console.log("LAI")
      //           chartdiv = 'LAIChartdiv'
      //           break;    
      //         case "ET":
      //           console.log("ET")
      //           chartdiv = 'ETChartdiv'
      //           break;    
      //         case "EVI":
      //           console.log("EVI")
      //           chartdiv = 'EVIChartdiv'
      //           break;    
      //         case "NPP":
      //           console.log("NPP")
      //           chartdiv = 'NPPChartdiv'
      //           break;    
      //         case "Population Count":
      //           console.log("Population Count")
      //           chartdiv = 'populationCountChartdiv'
      //           break;    
      //         case "Population Density":
      //           console.log("Population Density")
      //           chartdiv = 'populationDensityChartdiv'
      //           break;    
      //       }
      //       console.log(type)
      //       let div = document.getElementById(chartdiv);
      //       div.style.display = 'block'; // 显示，且占据空间

      //       let chartInstance
      //       switch (type) {  
      //         case "Elevation":
      //           console.log("Elevation")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('elevationChart'));
      //           break;  
      //         case "NDVI":
      //           console.log("NDVI")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('NDVIChart'));
      //           break;  
      //         case "Landuse":
      //           console.log("Landuse")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('landuseChart'));
      //           break;   
      //         case "Soil":
      //           console.log("Soil")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('soilChart'));
      //           break;  
      //         case "Geological":
      //           console.log("Geological")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('geologicalChart'));
      //           break;  
      //         case "Porosity":
      //           console.log("Porosity")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('porosityChart'));
      //           break;    
      //         case "LAI":
      //           console.log("LAI")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('LAIChart'));
      //           break;    
      //         case "NPP":
      //           console.log("NPP")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('NPPChart'));
      //           break;    
      //         case "EVI":
      //           console.log("EVI")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('EVIChart'));
      //           break;    
      //         case "ET":
      //           console.log("ET")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('ETChart'));
      //           break;    
      //         case "Subsurface Permeability":
      //           console.log("Subsurface Permeability")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('subsurfacePermeabilityChart'));
      //           break;    
      //         case "Population Count":
      //           console.log("Population Count")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('populationCountChart'));
      //           break;    
      //         case "Population Density":
      //           console.log("Population Density")
      //           chartInstance = echarts.getInstanceByDom(document.getElementById('populationDensityChart'));
      //           break;    

                
      //       }
      //       console.log(type)
      //       console.log(chartInstance)
      //       console.log(this.oldradius)
      //       console.log(this.radius)
      //       console.log(this.oldradius != this.radius)

      //       chartInstance.showLoading();
            
      //       // 数值型
      //       if (type == "Elevation" || type == "NDVI" ||  type == "Porosity" ||  type == "LAI" ||  type == "EVI" ||  type == "ET" ||  type == "NPP" ||  type == "Subsurface Permeability" || type == "Population Count"|| type == "Population Density") {
      //           // 上一次TypeSelect是否包含当前选中的所有Type
      //           if (this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata) && this.textDatas[type].length != 0 && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
      //               this.textData[type] = this.textDatas[type][this.pointSelect - 1]
      //               console.log(this.textData[type])
      //               var option;
      //               chartInstance.clear();
      //               var max = ""
      //               var mean = ""
      //               var min = ""
      //               if (this.textData[type] != undefined) {
      //                 var max = this.textData[type].max
      //                 var mean = this.textData[type].mean
      //                 var min = this.textData[type].min
      //               }

      //               option = {
      //                   title: {
      //                     text: type,
      //                     left: 'center'
      //                   },
      //                   radar: {
      //                       // shape: 'circle',
      //                       indicator: [
      //                           { name: 'mean', max: max},
      //                           { name: 'max', max: max},
      //                           { name: 'min', max: max}
      //                       ]
      //                   },
      //                   tooltip: {
      //                       trigger: 'item',
      //                       textStyle:{fontSize: 12}
      //                   },
      //                   series: [
      //                       {
      //                       type: 'radar',
      //                       data: [
      //                           {
      //                               value: [mean, max, min],
      //                               name: type
      //                           }
      //                       ]
      //                       }
      //                   ]
      //               };
      //               option && chartInstance.setOption(option);
      //               chartInstance.hideLoading();
      //               if (type == this.TypeList[this.TypeList.length - 1]){
      //                 _this.$Notice.close('static')
      //                 _this.$Notice.success({
      //                     title: '流域环境因子提取完成！',
      //                     duration: 0
      //                 });
      //               }
      //           }
      //           else{
      //               console.log("请求后端")
      //               this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));

      //               let params = new URLSearchParams();
      //               params.append("basinType", this.basinType);
      //               let sourcetype = "1"
      //               if (this.sourceSelectdata[type] != this.globalsourcedata[type] || (type == "Elevation" && this.sourceSelectdata['dem'] != this.globalsourcedata['dem'])) {
      //                 sourcetype = "2"
      //               }
      //               console.log(sourcetype)
      //               params.append("sourcetype", sourcetype);
      //               params.append("type", type);
      //               params.append("radius", this.radius);
      //               params.append("pointdata", dataStr);
      //               params.append("projectName", this.projectName);
      //               params.append("username", sessionStorage.getItem('username'));
      //               request.post('/file/statisticsNDVI', params)

      //               // 轮询
      //               console.log("轮询")
      //               let current_type = type
      //               let timer2 = window.setInterval(() => {
      //                 setTimeout( () =>{
      //                   let polling = new FormData();
      //                   polling.append("projectname", this.projectName);
      //                   polling.append("username", sessionStorage.getItem('username'));
      //                   polling.append('filepathandname',"data_prepare/spatial/" + type + "Static.txt") //生成的最后一个文件是txt文件，以此作为结束的标志
      //                   request.post("/Polling", polling)
      //                     .then(res=>{
      //                       console.log(res.data.errCode);
      //                       if (res.data.errCode == 200) {
      //                         this.basinRespons = true
      //                         _this.$Notice.success({
      //                           title: current_type + '环境因子提取成功！',
      //                           duration: 0
      //                         });
      //                         // 清除定时器
      //                         clearInterval(timer2)
      //                         console.log(res.data)
      //                         this.textDatas[type] = res.data.data
      //                         this.textData[type] = res.data.data[this.pointSelect - 1]
      //                         this.pointList = new Array(this.POIdata.length).fill(1).map((v, i) => ++i);
      //                         this.oldPOIdata = [...this.POIdata]
      //                         this.oldTypeList = [...this.TypeList]
      //                         this.oldradius = this.radius
      //                         // 向div中添加文字  
      //                         // myDiv.innerHTML = JSON.stringify(this.textData[type])
      //                         var option;
      //                         chartInstance.clear();
      //                         // chartInstance.showLoading();
      //                         var max = ""
      //                         var mean = ""
      //                         var min = ""
      //                         if (this.textData[type] != undefined) {
      //                           var max = this.textData[type].max
      //                           var mean = this.textData[type].mean
      //                           var min = this.textData[type].min
      //                         }
                              
      //                         option = {
      //                             title: {
      //                               text: type,
      //                               left: 'center'
      //                             },
      //                             radar: {
      //                                 // shape: 'circle',
      //                                 indicator: [
      //                                     { name: 'mean', max: max},
      //                                     { name: 'max', max: max},
      //                                     { name: 'min', max: max}
      //                                 ]
      //                             },
      //                             tooltip: {
      //                                 trigger: 'item',
      //                                 textStyle:{fontSize: 10}
      //                             },
      //                             series: [
      //                                 {
      //                                 type: 'radar',
      //                                 data: [
      //                                     {
      //                                         value: [mean, max, min],
      //                                         name: type
      //                                     }
      //                                 ]
      //                                 }
      //                             ]
      //                         };
      //                         option && chartInstance.setOption(option);
      //                         chartInstance.hideLoading();
      //                         this.disabled = false;
      //                         this.loading = false;    
      //                         if (type == this.TypeList[this.TypeList.length - 1]){
      //                           _this.$Notice.close('static')
      //                           _this.$Notice.success({
      //                               title: '流域环境因子提取完成！',
      //                               duration: 0
      //                           });
      //                         }
      //                       }else if(res.data.errCode == 204){
      //                         // 继续轮询
      //                         console.log("继续轮询")
      //                       }else {
      //                         this.$Notice.success({
      //                           title: "结果计算失败",
      //                           duration: 0,
      //                         });
      //                       }
      //                     })
      //                     .catch(err=>{
      //                       console.log(err);
      //                       // 清除定时器
      //                       clearInterval(timer2)
      //                       confirm('运行失败!');
      //                     });
      //                 }, 0);
      //               }, 5000);
      //           }
      //       }
      //       //类型
      //       else {
      //           console.log("进去了") 
      //           if (this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata) && this.chartDatas[type].length != 0 && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
      //               this.disabled = false;
      //               this.chartData[type] = this.chartDatas[type][this.pointSelect - 1]
      //               chartInstance.clear();
      //               var option;
      //               option = {
      //                   // legend: {
      //                   //     top: 'bottom'
      //                   // },
      //                   title: {
      //                     text: type,
      //                     left: 'center'
      //                   },
      //                   labelLine: {
      //                       normal: {
      //                           length: 5,  // 调整线长，根据需求设置合适的值
      //                           length2: 5  // 调整线的第二段长度，这样可以更好地控制线条在饼图外的长度
      //                       }
      //                   },
      //                   tooltip: {
      //                       trigger: 'item',
      //                       formatter: '{b} : {d}%',
      //                       textStyle:{
      //                           fontSize: 12
      //                       }
      //                   },
      //                   label: {
      //                       normal: {
      //                           show: true,
      //                           textStyle: {
      //                               fontSize: 3 // 调整字号大小
      //                           }
      //                       }
      //                   },
      //                   // toolbox: {
      //                   //     show: true,
      //                   //     feature: {
      //                   //         mark: { show: true },
      //                   //         dataView: { show: true, readOnly: false },
      //                   //         restore: { show: true },
      //                   //         saveAsImage: { show: true }
      //                   //     }
      //                   // },
      //                   series: [
      //                       {
      //                           name: 'Nightingale Chart',
      //                           type: 'pie',
      //                           radius: [40, 100],
      //                           center: ['50%', '50%'],
      //                           roseType: 'radius',
      //                           itemStyle: {
      //                               borderRadius: 8
      //                           },
      //                           data: this.chartData[type]
      //                       }
      //                   ]
      //               };
      //               option && chartInstance.setOption(option);
      //               chartInstance.hideLoading();
      //               this.loading = false;
      //               if (type == this.TypeList[this.TypeList.length - 1]){
      //                 this.$Notice.close('static')
      //                 _this.$Notice.success({
      //                   title: '流域环境因子提取完成！',
      //                   duration: 0
      //                 });
      //               }
      //           }
      //           else{
      //               console.log("请求后端")
      //               this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));
      //               let params = new URLSearchParams();
      //               params.append("basinType", this.basinType);
      //               let sourcetype = "1"
      //               if (this.sourceSelectdata[type] != this.globalsourcedata[type]) {
      //                 sourcetype = "2"
      //               }
      //               console.log(sourcetype)
      //               params.append("sourcetype", sourcetype);
      //               params.append("type", type);
      //               params.append("radius", this.radius);
      //               params.append("pointdata", dataStr);
      //               params.append("projectName", this.projectName);
      //               params.append("username", sessionStorage.getItem('username'));
      //               request.post('/file/statisticsLandUseSta', params)
                        
                    
      //               // 轮询
      //               console.log("轮询")
      //               let timer = window.setInterval(() => {
      //                 setTimeout( () =>{
      //                   let polling = new FormData();
      //                   polling.append("projectname", this.projectName);
      //                   polling.append("username", sessionStorage.getItem('username'));
      //                   polling.append('filepathandname',"data_prepare/spatial/" + type + "Static.txt") //生成的最后一个文件是txt文件，以此作为结束的标志
      //                   request.post("/Polling", polling)
      //                     .then(res=>{
      //                       // console.log(res.data.errCode);
      //                       if (res.data.errCode == 200) {
      //                         // 清除定时器
      //                         clearInterval(timer)
                              
      //                         this.basinRespons = true;
      //                         _this.$Notice.success({
      //                           title: type + '环境因子提取成功！',
      //                           duration: 0
      //                         });

      //                         console.log(res.data.data)
      //                         this.chartDatas[type] = res.data.data
      //                         this.chartData[type] = res.data.data[this.pointSelect - 1]
      //                         this.pointList = new Array(this.POIdata.length).fill(1).map((v, i) => ++i);
      //                         this.oldPOIdata = [...this.POIdata]
      //                         this.oldTypeList = [...this.TypeList]
      //                         this.oldradius = this.radius
      //                         chartInstance.clear();
      //                         var option;
      //                         option = {
      //                             // legend: {
      //                             //     top: 'bottom'
      //                             // },
      //                             title: {
      //                                 text: type,
      //                                 left: 'center'
      //                               },
      //                             labelLine: {
      //                                 normal: {
      //                                     length: 5,  // 调整线长，根据需求设置合适的值
      //                                     length2: 5
      //                                 }
      //                             },
      //                             label: {
      //                                 normal: {
      //                                     show: true,
      //                                     textStyle: {
      //                                         fontSize: 3 // 调整字号大小
      //                                     }
      //                                 }
      //                             },
      //                             tooltip: {
      //                                 trigger: 'item',
      //                                 formatter: '{b} : {d}%',
      //                                 textStyle:{
      //                                     fontSize: 12
      //                                 }
      //                             },
      //                             // toolbox: {
      //                             //     show: true,
      //                             //     feature: {
      //                             //         mark: { show: true },
      //                             //         dataView: { show: true, readOnly: false },
      //                             //         restore: { show: true },
      //                             //         saveAsImage: { show: true }
      //                             //     }
      //                             // },
      //                             series: [
      //                                 {
      //                                     name: 'Nightingale Chart',
      //                                     type: 'pie',
      //                                     radius: [40, 100],
      //                                     center: ['50%', '50%'],
      //                                     roseType: 'radius',
      //                                     itemStyle: {
      //                                         borderRadius: 8
      //                                     },
      //                                     data: this.chartData[type]
      //                                 }
      //                             ]
      //                         };
      //                         option && chartInstance.setOption(option);
      //                         chartInstance.hideLoading();
      //                         if (type == this.TypeList[this.TypeList.length - 1]){
      //                           this.$Notice.close('static')
      //                           _this.$Notice.success({
      //                               title: '流域环境因子提取完成！',
      //                               duration: 0,
      //                           });
      //                         }  
      //                       }else if(res.data.errCode == 204){
      //                         // 继续轮询
      //                         console.log("继续轮询")
      //                       }else {
      //                         this.$Notice.success({
      //                           title: "结果计算失败",
      //                           duration: 0,
      //                         });
      //                       }
      //                     })
      //                     .catch(err=>{
      //                       console.log(err);
      //                       confirm('运行失败!');
      //                       // 清除定时器
      //                       clearInterval(timer)
      //                     });
      //                 }, 0);
      //               }, 2000);
                     
      //           }
      //       }
      //     }
      //     clearInterval(pollData);
      //   }
      // }, 10000); // 每隔10秒检查一次

      // 现环境因子轮询算法：只提交计算请求，不轮询。轮询放在viewdata中

      // 
      const pollData = setInterval(() => {
        // 当流域范围提取完成后请求后端提取流域属性
        if (this.basinRespons) {
          // 清楚计时器
          clearInterval(pollData);

          _this.$Notice.info({
            name: 'static',
            title: 'Extracting watershed attributes, please wait!',
            duration: 0
          });
          
          console.log(this.TypeList)
          // 显示要展示的环境因子图表，并请求后端计算环境因子
          for (let type of this.TypeList) {
            //改变报表显示的列
            if (type == "Elevation" || type == "Slope" || type == "Area"){

            }
            else{
              this.columns.push({
                title:  type,
                align: 'center',
                children: this.variables[type]
              })
            }
            
            // 数值型
            if (type == "Glacier" || type == "Permafrost" || type == "Climate" ||type == "Human Footprint 2009" || type == "Total GDP 2015" || type == "Per Capita GDP 2015" || type == "HDI 2009" || type == "Nighttime Lights 2013" || type == "Road Density" || type == "Elevation" || type == "Slope" || type == "Area" || type == "NDVI" ||  type == "Porosity" ||  type == "LAI" ||  type == "EVI" ||  type == "ET" ||  type == "NPP" ||  type == "GPP" ||  type == "Subsurface Permeability" || type == "Population Count"|| type == "Population Density"|| type == "Soil Properties") {
                // 上一次TypeSelect是否包含当前选中的所有Type
                if (this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata) && this.textDatas[type].length != 0 && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
                    // this.textData[type] = this.textDatas[type][this.pointSelect - 1]
                    // console.log(this.textData[type])
                    // var option;
                    // var max = ""
                    // var mean = ""
                    // var min = ""
                    // if (this.textData[type] != undefined) {
                    //   var max = this.textData[type].max
                    //   var mean = this.textData[type].mean
                    //   var min = this.textData[type].min
                    // }

                    // option = {
                    //     title: {
                    //       text: type,
                    //       left: 'center'
                    //     },
                    //     radar: {
                    //         // shape: 'circle',
                    //         indicator: [
                    //             { name: 'mean', max: max},
                    //             { name: 'max', max: max},
                    //             { name: 'min', max: max}
                    //         ]
                    //     },
                    //     tooltip: {
                    //         trigger: 'item',
                    //         textStyle:{fontSize: 12}
                    //     },
                    //     series: [
                    //         {
                    //         type: 'radar',
                    //         data: [
                    //             {
                    //                 value: [mean, max, min],
                    //                 name: type
                    //             }
                    //         ]
                    //         }
                    //     ]
                    // };
                    // option && chartInstance.setOption(option);
                    // chartInstance.hideLoading();
                    if (type == this.TypeList[this.TypeList.length - 1]){
                      _this.$Notice.close('static')
                      _this.$Notice.success({
                          title: 'watershed attributes extraction completed!',
                          duration: 0
                      });
                    }
                }
                else{
                    console.log("请求后端")
                    console.log(type)
                    this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));

                    let params = new URLSearchParams();
                    params.append("basinType", this.basinType);
                    let sourcetype = "1"
                    if (this.sourceSelectdata[type] != this.globalsourcedata[type] || (type == "Elevation" && this.sourceSelectdata['dem'] != this.globalsourcedata['dem'])) {
                      sourcetype = "2"
                    }
                    console.log(sourcetype)
                    params.append("sourcetype", sourcetype);
                    params.append("type", type);
                    params.append("radius", this.radius);
                    params.append("pointdata", dataStr);
                    params.append("projectName", this.projectName);
                    params.append("username", sessionStorage.getItem('username'));
                    request.post('/file/statisticsNDVI', params)
                }
            }
            //类型
            else {
                console.log("类型") 
                if (this.oldPOIdata && JSON.stringify(this.oldPOIdata) === JSON.stringify(this.POIdata) && this.chartDatas[type].length != 0 && this.oldradius == this.radius && JSON.stringify(this.sourceSelectdata) === JSON.stringify(this.old_sourceSelectdata) && this.oldTypeList.length != 0 && this.containsArray(this.oldTypeList, this.TypeList)){
                    this.disabled = false;
                    this.chartData[type] = this.chartDatas[type][this.pointSelect - 1]
                    var option;
                    option = {
                        // legend: {
                        //     top: 'bottom'
                        // },
                        title: {
                          text: type,
                          left: 'center'
                        },
                        labelLine: {
                            normal: {
                                length: 5,  // 调整线长，根据需求设置合适的值
                                length2: 5  // 调整线的第二段长度，这样可以更好地控制线条在饼图外的长度
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{b} : {d}%',
                            textStyle:{
                                fontSize: 12
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                textStyle: {
                                    fontSize: 3 // 调整字号大小
                                }
                            }
                        },
                        // toolbox: {
                        //     show: true,
                        //     feature: {
                        //         mark: { show: true },
                        //         dataView: { show: true, readOnly: false },
                        //         restore: { show: true },
                        //         saveAsImage: { show: true }
                        //     }
                        // },
                        series: [
                            {
                                name: 'Nightingale Chart',
                                type: 'pie',
                                radius: [40, 100],
                                center: ['50%', '50%'],
                                roseType: 'radius',
                                itemStyle: {
                                    borderRadius: 8
                                },
                                data: this.chartData[type]
                            }
                        ]
                    };
                    option && chartInstance.setOption(option);
                    chartInstance.hideLoading();
                    this.loading = false;
                    if (type == this.TypeList[this.TypeList.length - 1]){
                      this.$Notice.close('static')
                      _this.$Notice.success({
                        title: 'watershed attributes extraction completed!',
                        duration: 0
                      });
                    }
                }
                else{
                    console.log("请求后端")
                    this.old_sourceSelectdata = JSON.parse(JSON.stringify(this.sourceSelectdata));
                    let params = new URLSearchParams();
                    params.append("basinType", this.basinType);
                    let sourcetype = "1"
                    if (this.sourceSelectdata[type] != this.globalsourcedata[type]) {
                      sourcetype = "2"
                    }
                    console.log(sourcetype)
                    params.append("sourcetype", sourcetype);
                    params.append("type", type);
                    params.append("radius", this.radius);
                    params.append("pointdata", dataStr);
                    params.append("projectName", this.projectName);
                    params.append("username", sessionStorage.getItem('username'));
                    request.post('/file/statisticsLandUseSta', params)
                }
            }
          }
        }
      }, 10000); // 每隔10秒检查一次，是否发送计算流域属性请求
    },
    containsArray(superset, subset) {
      return subset.every(value => superset.includes(value));
    },
    // 弃用
    pointSelectChange() {
      console.log("pointSelectChange")
      for (let type of this.TypeList) {
        let chartInstance
        switch (type) {  
          case "Elevation":
            console.log("Elevation")
            chartInstance = echarts.getInstanceByDom(document.getElementById('elevationChart'));
            break;  
          case "NDVI":
            console.log("NDVI")
            chartInstance = echarts.getInstanceByDom(document.getElementById('NDVIChart'));
            break;  
          case "Landuse":
            console.log("Landuse")
            chartInstance = echarts.getInstanceByDom(document.getElementById('landuseChart'));
            break;   
          case "Soiltype":
            console.log("Soil")
            chartInstance = echarts.getInstanceByDom(document.getElementById('soilChart'));
            break;  
          case "Geological":
            console.log("Geological")
            chartInstance = echarts.getInstanceByDom(document.getElementById('geologicalChart'));
            break;  
          case "Porosity":
            console.log("Porosity")
            chartInstance = echarts.getInstanceByDom(document.getElementById('porosityChart'));
            break;
          case "LAI":
            console.log("LAI")
            chartInstance = echarts.getInstanceByDom(document.getElementById('LAIChart'));
            break;    
          case "NPP":
            console.log("NPP")
            chartInstance = echarts.getInstanceByDom(document.getElementById('NPPChart'));
            break;    
          case "EVI":
            console.log("EVI")
            chartInstance = echarts.getInstanceByDom(document.getElementById('EVIChart'));
            break;    
          case "ET":
            console.log("ET")
            chartInstance = echarts.getInstanceByDom(document.getElementById('ETChart'));
            break;    
          case "Subsurface Permeability":
            console.log("Subsurface Permeability")
            chartInstance = echarts.getInstanceByDom(document.getElementById('subsurfacePermeabilityChart'));
            break;    
          case "Population Count":
            console.log("Population Count")
            chartInstance = echarts.getInstanceByDom(document.getElementById('populationCountChart'));
            break;    
          case "Population Density":
            console.log("Population Density")
            chartInstance = echarts.getInstanceByDom(document.getElementById('populationDensityChart'));
            break;    
            
        }
        chartInstance.showLoading();
        console.log(this.pointSelect)
        if ( type == "Elevation" || type == "NDVI" ||  type == "Porosity" ||  type == "LAI" ||  type == "EVI" ||  type == "ET" ||  type == "NPP" ||  type == "Subsurface Permeability" 
        || type == "Population Count"|| type == "Population Density" ) {
            // 简单插入文本
            // var myDiv = document.getElementById('landuseChart');  
            // this.textData[this.typeSelect] = this.textDatas[this.typeSelect][this.pointSelect - 1]
            // myDiv.innerHTML = JSON.stringify(this.textData[this.typeSelect])
            this.textData[type] = this.textDatas[type][this.pointSelect - 1]
            console.log(this.textData[type])
            var option;
            chartInstance.clear();
            var max = this.textData[type].max
            var mean = this.textData[type].mean
            var min = this.textData[type].min

            option = {
                title: {
                  text: type,
                  left: 'center'
                },
                radar: {
                    // shape: 'circle',
                    indicator: [
                        { name: 'mean', max: max},
                        { name: 'max', max: max},
                        { name: 'min', max: max}
                    ]
                },
                tooltip: {
                    trigger: 'item',
                    textStyle:{fontSize: 10}
                },
                series: [
                    {
                    type: 'radar',
                    data: [
                        {
                            value: [mean, max, min],
                            name: type
                        }
                    ]
                    }
                ]
            };
            option && chartInstance.setOption(option);
            chartInstance.hideLoading();
        }else {
            this.chartData[type] = this.chartDatas[type][this.pointSelect - 1]
            // var chartDom = document.getElementById('landuseChart');
            // var myChart = echarts.init(chartDom);
            var option;
            chartInstance.clear();
            option = {
                title: {
                  text: type,
                  left: 'center'
                },
                labelLine: {
                    normal: {
                        length: 5,  // 调整线长，根据需求设置合适的值
                        length2: 5
                    }
                },
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            fontSize: 3 // 调整字号大小
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: [40, 100],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: this.chartData[type]
                    }
                ]
            };
            option && chartInstance.setOption(option);
            chartInstance.hideLoading();
        }

        var lat = this.POIdata[this.pointSelect - 1].lat;
        var lon = this.POIdata[this.pointSelect - 1].lon;
        this.mapCM.flyTo(new L.LatLng(lat, lon), 8)
      }
    },
    //弃用
    initChart() {
        // $('#landuseChart').css('height', '200px')
        console.log("初始化图表")
        var chartDom = document.getElementById('NDVIChart');
        var myChart = echarts.init(chartDom);

        chartDom = document.getElementById('landuseChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('soilChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('porosityChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('geologicalChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('LAIChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('EVIChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('ETChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('NPPChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('subsurfacePermeabilityChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('populationCountChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('populationDensityChart');
        myChart = echarts.init(chartDom);

        chartDom = document.getElementById('elevationChart');
        myChart = echarts.init(chartDom);
        
        // this.chart = myChart
    },
    selectPOISwitchOff() {
      this.selectPOISwitch = false
    },
    switchChange() {
      if (this.selectPOISwitch) {
        eventBus.$emit("change-cursor");
        this.riverShowTemp = false;
      } else {
        eventBus.$emit("change-cursor-pointer");
      }
    },
    exportData (type) {
        if (type === 1) {
            this.$refs.table.exportCsv({
                filename: 'The original data'
            });
        } else if (type === 2) {
            this.$refs.table.exportCsv({
                filename: 'Sorting and filtering data',
                original: false
            });
        } else if (type === 3) {
            this.$refs.table.exportCsv({
                filename: 'Custom data',
                columns: this.columns8.filter((col, index) => index < 4),
                data: this.data7.filter((data, index) => index < 4)
            });
        }
    },
    async exportShpData() {
      try {
        // 第一步：请求打包文件
        const params1 = new URLSearchParams();
        params1.append("projectname1", this.projectName);
        params1.append("username1", sessionStorage.getItem('username'));
        
        const packResponse = await request.post('/file/DownloadBasinshps', params1);
        
        if (packResponse.data.errCode !== 200) {
          this.$Message.error({
            content: '文件打包失败！',
            duration: 3
          });
          return;
        }
        
        this.$Message.success({
          content: '文件打包完成！',
          duration: 3
        });
        
        // 第二步：下载打包好的文件
        const params2 = new URLSearchParams();
        params2.append("filename", "basin_shp");
        params2.append("projectname1", this.projectName);
        params2.append("username1", sessionStorage.getItem('username'));
        
        // const downloadResponse = await request.post('/infboy/downZip', params2);
        
        // if (downloadResponse.data.errCode === 200) {
        //   this.$Message.success({
        //     content: '文件下载完成！',
        //     duration: 3
        //   });
        // } else {
        //   this.$Message.error({
        //     content: '文件下载失败！',
        //     duration: 3
        //   });
        // }

        request.post("/file/downloadBasinshps", params2, {
              responseType: 'blob'
            },
          )
          .then(res => {
            var fileName = "basin_shp.zip";
            var fileURL = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', fileName);
            document.body.appendChild(fileLink);
            fileLink.click();
            // 下载完成移除元素
            // document.body.removeChild(a);
            // 释放掉blob对象
            window.URL.revokeObjectURL(fileURL);
          })
          .catch(e => {
            this.$Notice.error('下载文件失败');
          })
        } catch (error) {
          console.error(error);
          this.$Message.error('操作失败！');
        }
    } 
  },
}
</script>

<style scoped>
.ivu-select-dropdown {
  max-height: 200px; /* 设置下拉菜单的最大高度 */
  overflow: auto; /* 添加滚动条 */
}
</style>

<style>
/* .ivu-divider-horizontal.ivu-divider-with-text-left{
      margin: 16px 0px 10px 0px;
  } */
.ivu-btn {
  padding: 0px 9px;
}

.ivu-tabs-nav-wrap {
  text-align: center;
}

.ivu-tabs-nav-scroll {
  display: table;
}

.ivu-table-small {
    font-size: 10px;
}

.ivu-table-cell {
    padding-left: 4px;
    padding-right: 4px;
}

.upload {
  display: inline-block;
}

.selectFlex {
  margin: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.selectFlexBasin {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.finishBtn {
  display: flex;
  justify-content: center;
  margin-top: 0px;
  margin-left: 30px;
  margin-right: 30px;
  text-align: center;
}

.finishBtn>button {
  width: 90%;
}

.finishFont {
  color: #19be6b;
}

/* #streamValueForm .ivu-form-item {
    margin-bottom: 5px;
  } */
.leaflet-container.crosshair-cursor-enabled {
  cursor: crosshair;
}

.cross-cursor {
  cursor: crosshair !important;

}

.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
</style>
<!--
 * @Author: BinjieYuan yuanbj9035@163.com
 * @Date: 2022-05-08 21:49:16
 * @LastEditors: BinjieYuan yuanbj9035@163.com
 * @LastEditTime: 2022-11-20 21:08:32
 * @FilePath: \WebBasin\front\src\components\mapcontrol\GeoDataShowControl.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <!-- optionally define the sidebar content via HTML markup -->
    <div id="sidebar" class="leaflet-sidebar collapsed" style="height: 25%;left: 10px;">
      <!-- nav tabs -->
      <div class="leaflet-sidebar-tabs">
        <!-- top aligned tabs -->
        <ul role="tablist">
          
          <li>
            <a href="#selfdefine" role="tab">
              <Icon type="md-medal" />
            </a>
          </li>

        </ul>
        <!-- bottom aligned tabs -->
        <ul role="tablist">
          <li><a href="https://github.com/nickpeihl/leaflet-sidebar-v2"><i class="fa fa-github"></i></a></li>
        </ul>
      </div>
      <!-- panel content -->
      <div class="leaflet-sidebar-content">
        
        
        <div class="leaflet-sidebar-pane" id="selfdefine">
          <h1 class="leaflet-sidebar-header">
            <span class="leaflet-sidebar-close"><i class="fa fa-caret-left"></i></span>
          </h1>

          <div>
            <Menu ref="menuActive" theme="light" width="auto">
              <MenuItem name="/river" @click.native="showRiver">
              <Icon type="ios-search"></Icon>
              <span>Extraction of river-watershed attributes</span>
              </MenuItem>

              <MenuItem name="/lake" @click.native="showLake">
              <Icon type="ios-search"></Icon>
              <span>Extraction of lake-watershed attributes</span>
              </MenuItem>

              <!-- <MenuItem name="/basinAttribute"  @click.native="showBasinAttribute">
              <Icon type="ios-settings"></Icon>
              <span>流域特征</span>
              </MenuItem> -->
              <!-- <MenuItem name="/soilType" @click.native="showSoilType">
              <Icon type="ios-search"></Icon>
              <span>河流流域环境因子</span>
              </MenuItem> -->
              <!-- <MenuItem name="/landuse" @click.native="showLandUse">
              <Icon type="ios-search"></Icon>
              <span>湖泊流域环境因子</span>
              </MenuItem> -->
              <!-- <MenuItem name="/soiltype" @click.native="showSoilType">
              <Icon type="ios-settings"></Icon>
              <span>土壤类型</span>
              </MenuItem>
              <MenuItem name="/GLiM" @click.native="showGLiM">
              <Icon type="ios-settings"></Icon>
              <span>地质类型</span>
              </MenuItem>
              <MenuItem name="/calimodel" @click.native="">
              <Icon type="ios-settings"></Icon>
              <span>地形因子</span>
              </MenuItem>
              <MenuItem name="1-3">
              <Icon type="ios-settings"></Icon>
              <span>气象因子</span>
              </MenuItem>
              <MenuItem name="1-3">
              <Icon type="ios-settings"></Icon>
              <span>人类活动</span>
              </MenuItem> -->
            </Menu>
          </div>
        </div>
      </div>
    </div>
    <div>
      <!-- <basin-show :basinShow.sync="basinShow"></basin-show> -->
      <River :riverShow.sync="riverShow" @changeLayerStatus="changeLayerStatus" ref="river"></River>
      <Lake :lakeShow.sync="lakeShow" ref="lake"></Lake>
    </div>
  </div>
</template>

<script>
import "@/assets/js/leaflet-sidebar.min.js";
import TimeSeriesChart from "../charts/TimeSeriesChart"
// import visualizationFrozenSoil from "../charts/visualizationFrozenSoil"
import { request } from "@/network/request";

// import BasinShow from '../control/BasinShow'
import River from '../seimscontrol/River'
import Lake from '../seimscontrol/Lake'


export default {
  name: 'GeoDataShowControl',
  components: { River, Lake },
  data() {
    return {
      lakeShow: false,
      riverShow: false,
      //
      chartShow: false,
      visualizationFrozenSoilShow: false,
      map: null,
      basinDataLayerGroup: null,
      PanelShowValue: ['vector', 'raster'],
      vectorGroup: [],
      rasterGroup: [],
      vectorShowGroup: [],
      rasterShowGroup: [],
      vectorLayerId: '',
      rasterLayerId: '',
      projectname: '',
      PanelShowChart: ['modelParam', 'modelParam2'],
      chartGroup: [],
      otherChartGroup: [],
      disabledDem: true,
      disabledFlowDir: true,
      disabledAcc: true,
      disabledSubbasinR: true,
      disabledStreamLink: true,
      disabledLandcover: true,
      disabledSoiltype: true,
      disabledBasinScope: true,
      disabledOutlet: true,
      disabledReach: true,
      disabledSubbasinV: true,

      basinBoundChecked: false,
      basinOutletChecked: false,
      subBasinChecked: false,
      streamChecked: false,
      HLUChecked: false,
      subBasinOutletChecked: false,
      

    }
  },

  mounted() {
    this.map = this.$store.getters.storeMap;
    this.addSideBar();
    this.initBasinLayerGroup();
    this.vectorLayerId = new Map();
    this.rasterLayerId = new Map();
  },
  updated() {
    this.projectName = this.$store.getters.projectName;
  },
  methods: {
    changeLayerStatus(layerName, status) {
      switch (layerName) {
        case "basinbound":
          console.log("basinbound");
          this.basinBoundChecked = status;
          if (status) { this.vectorShowGroup.push("basinBoundLayer"); this.vectorGroup.push("basinBoundLayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "basinBoundLayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "basinBoundLayer") }
          break;
        case "basinoutlet":
          console.log("basinoutlet");
          this.basinOutletChecked = status;
          if (status) { this.vectorShowGroup.push("basinOutletLayer"); this.vectorGroup.push("basinOutletLayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "basinOutletLayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "basinOutletLayer") }
          break;
        case "subBasin":
          console.log("subBasin");
          this.subBasinChecked = status;
          if (status) { this.vectorShowGroup.push("subBasinLayer"); this.vectorGroup.push("subBasinLayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "subBasinLayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "subBasinLayer") }
          break;
        case "stream":
          console.log("stream");
          this.streamChecked = status;
          if (status) { this.vectorShowGroup.push("streamLayer"); this.vectorGroup.push("streamLayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "streamLayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "streamLayer") }
          break;
        case "HLU":
          console.log("HLU");
          this.HLUChecked = status;
          if (status) { this.vectorShowGroup.push("HLULayer"); this.vectorGroup.push("HLULayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "HLULayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "HLULayer") }
          break;
        case "subbasinoutlet":
          console.log("subbasinoutlet");
          this.subbasinoutlet = status;
          if (status) { this.vectorShowGroup.push("subBasinOutletLayer"); this.vectorGroup.push("subBasinOutletLayer"); }
          else { this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== "subBasinOutletLayer"); this.vectorGroup = this.vectorGroup.filter(item => item !== "subBasinOutletLayer") }
          break;
        default:
          console.log("I don't own a pet");
          break;
      }
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        // 发送POST请求到后端
        // 请替换成你的后端API地址
        fetch('http://localhost:8083/infboy/upload', {
          method: 'POST',
          body: formData
        })
          .then(response => {
            // // 处理后端的响应
            // // 在URL后面添加随机参数
            // const randomParam = Math.random();
            // const randomParam2 = Math.random();
            // const newURL2 = 'http://localhost:8083/infboy/downLandUseSta?rand=' + randomParam + randomParam2;
            // var downloadRandName2 = 'downloadLink' + randomParam2;
            // downloadRandName2 = document.createElement('a');
            // downloadRandName2.href = newURL2;
            // //downloadRandName2.target = '_blank'; // 在新标签页中打开下载链接

            // // 模拟点击下载链接
            // downloadRandName2.click();
            console.log(response);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        alert('Please select a CSV file.');
      }
    },
    showRiver() {
      this.riverShow = !this.riverShow;
      this.lakeShow = false;
      this.$refs.lake.selectPOISwitchOff();
    },
    showLake() {
      this.lakeShow = !this.lakeShow;
      this.riverShow = false;
      this.$refs.river.selectPOISwitchOff();
    },

    //
    addSideBar() {
      var sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(this.map);
      // .open('home');
      sidebar.on('content', function (ev) {
        switch (ev.id) {
          case 'autopan':
            sidebar.options.autopan = true;
            break;
          default:
            sidebar.options.autopan = false;
        }
      });
    },
    initBasinLayerGroup() {
      this.basinDataLayerGroup = L.layerGroup([]);
      this.basinDataLayerGroup.addTo(this.map);
    },
    controlRasterLayer() {
      if (this.rasterGroup.length > this.rasterShowGroup.length) {
        // console.log("执行if");
        // let b = new Set(this.rasterShowGroup);
        // let addLayer = [...arr].filter(x => !b.has(x));  
        var addLayer = this.diff(this.rasterGroup, this.rasterShowGroup);
        this.showBasinRasterDataLayer(addLayer[0]);
        this.rasterShowGroup.push(addLayer[0]);
      } else {
        // console.log("执行else");
        //   else if (arr.length<this.rasterShowGroup.length){
        // console.log(arr);
        // console.log(this.rasterShowGroup);
        var removeLayer = this.getArrDifference(this.rasterShowGroup, this.rasterGroup);
        // console.log(removeLayer[0]);
        var removeId = this.rasterLayerId.get(removeLayer[0]);
        // console.log(removeId);
        this.basinDataLayerGroup.removeLayer(removeId);
        this.rasterShowGroup.splice(this.rasterShowGroup.indexOf(removeLayer), 1);
        this.rasterLayerId.delete(removeLayer[0]);
      }
    },
    controlVectorLayer() {
      console.log(this.vectorGroup)
      if (this.vectorGroup.length > this.vectorShowGroup.length) {
        //添加图层
        var addLayer = this.diff(this.vectorGroup, this.vectorShowGroup);
        console.log(addLayer)
        //设置图层显隐
        if (addLayer[0] == "basinOutletLayer") this.$store.getters[addLayer[0]].setOpacity(1);
        else {
          this.$store.getters[addLayer[0]].eachLayer(layer => {
            this.map.addLayer(layer);
          });
          // this.$store.getters[addLayer[0]].addTo(this.map);
        }

        // this.showBasinVectorDataLayer(addLayer[0]);//发布geoserver服务
        this.vectorShowGroup.push(addLayer[0]);
      } else {
        //删除图层
        var removeLayer = this.getArrDifference(this.vectorShowGroup, this.vectorGroup);
        console.log(removeLayer)
        // var removeId = this.vectorLayerId.get(removeLayer[0]);
        // this.basinDataLayerGroup.removeLayer(removeId);
        // this.vectorShowGroup.splice(this.vectorShowGroup.indexOf(removeLayer), 1);

        if (removeLayer[0] == "basinOutletLayer") this.$store.getters[removeLayer[0]].setOpacity(0);
        else {
          // this.$store.getters[removeLayer[0]].clearLayers();
          this.$store.getters[removeLayer[0]].eachLayer(layer => {
            this.map.removeLayer(layer);
          });
          // this.map.drawingBasinLayerGroup.clearLayers()
        }

        // if(this.basinBoundChecked) {
        //   this.$store.getters["basinBoundLayer"].eachLayer(layer => {
        //     this.map.addLayer(layer);
        //   });
        // }

        this.vectorShowGroup = this.vectorShowGroup.filter(item => item !== removeLayer[0]);
        // this.vectorShowGroup.delete(removeLayer[0]);
      }
    },
    showBasinRasterDataLayer(layerName) {
      console.log("执行showBasinDataLayer");
      // var baseUrl='http://223.2.42.157:7070/geoserver/';
      var baseUrl = 'http://localhost:8081/geoserver/';
      var wmsURL = baseUrl + this.projectName + '/wms';
      //   this.basinLayer = L.tileLayer.wms('http://210.26.48.56:30122/geoserver/Basin_shp/wms',{
      var layer = new L.tileLayer.wms(wmsURL, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        noWarp: true
      }).addTo(this.basinDataLayerGroup);
      var layerId = this.basinDataLayerGroup.getLayerId(layer);
      this.rasterLayerId.set(layerName, layerId);
    },
    showBasinVectorDataLayer(layerName) {
      console.log("执行showBasinDataLayer");
      var baseUrl = 'http://localhost:8081/geoserver/';
      // var wmsURL=baseUrl + 'test7' + '/wms';
      var wmsURL = baseUrl + this.projectName + '/wms';
      //   this.basinLayer = L.tileLayer.wms('http://210.26.48.56:30122/geoserver/Basin_shp/wms',{
      var layer = new L.tileLayer.wms(wmsURL, {
        layers: layerName + '_wgs84',
        format: 'image/png',
        transparent: true,
        noWarp: true
      }).addTo(this.basinDataLayerGroup);
      var layerId = this.basinDataLayerGroup.getLayerId(layer);
      this.vectorLayerId.set(layerName, layerId);
    },
    getArrDifference(arr1, arr2) {
      let b = new Set(arr2);
      let difference = [...arr1].filter(x => !b.has(x));
      return difference;
    },
    diff(arr1, arr2) {
      var newArr = [];
      var arr3 = arr1.concat(arr2);//将arr1和arr2合并为arr3
      function isContain(value) {
        //找出arr3中不存在于arr1和arr2中的元素
        return arr1.indexOf(value) == -1 || arr2.indexOf(value) == -1;
      }
      newArr = arr3.filter(isContain);
      return newArr;
    },
    controlChart() {
      this.chartShow = !this.chartShow;

    },
    controlVisualizationFrozenSoil() {
      this.visualizationFrozenSoilShow = !this.visualizationFrozenSoilShow;
    },
    geoserverPublihRaster(name) {
      this.projectName = this.$store.getters.projectName;
      var paramObj = {
        fileName: name + ".tif",
        workSpace: this.projectName,
        styleName: name,
        dataStoreName: name,
        layerName: name,
        dataType: 2,
        crs: "EPSG:4326"
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
          console.log(res);
          if (res.data.errCode == 200) {
            console.log("gerosrver publish success");
          } else {
            console.log("gerosrver publish failed");
          }
        }).catch(e => {
          console.log("gerosrver publish failed");
        })
    },
    geoserverPublihVector(name) {
      this.projectName = this.$store.getters.projectName;
      var paramObj = {
        fileName: name + ".shp",
        workSpace: this.projectName,
        styleName: name,
        dataStoreName: name,
        layerName: name,
        dataType: 1,
        crs: "EPSG:4326"
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
          console.log(res);
          if (res.data.errCode == 200) {
            console.log("gerosrver publish success");
          } else {
            console.log("gerosrver publish failed");
          }
        }).catch(e => {
          console.log("gerosrver publish failed");
        })
    },
    rasterDataShowClick(v, name) {
      this[v] = false;
      this.geoserverPublihRaster(name);
    },
    vectorDataShowClick(v, name) {
      this[v] = false;
      this.geoserverPublihVector(name);
    },
    reFreshRaster() {
      //恢复初始状态
      this.disabledDem = true;
      this.disabledFlowDir = true;
      this.disabledAcc = true;
      this.disabledSubbasinR = true;
      this.disabledStreamLink = true;
      this.disabledLandcover = true;
      this.disabledSoiltype = true;
    },
    reFreshVector() {
      this.disabledBasinScope = true;
      this.disabledOutlet = true;
      this.disabledReach = true;
      this.disabledSubbasinV = true;
    }
  }
}
</script>

<style>
@import url('../../assets/css/leaflet-sidebar.min.css');
@import url('https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css');
</style>
<style>
#BackgroundColor .ivu-collapse {
  background-color: rgba(247, 247, 247, 0.01);
}

#CollapseBackgroundColor .ivu-collapse-header {
  background-color: rgba(247, 247, 247, 0.7);
}

#CollapseBackgroundColor .ivu-collapse-content {
  background-color: rgba(255, 255, 255, 0.7);
}

.CheckBoxDiv {
  margin-bottom: 2px;
}
</style>
<!--
 * @Author: your name
 * @Date: 2022-04-25 20:59:19
 * @LastEditTime: 2023-06-14 16:35:44
 * @LastEditors: BinjieYuan yuanbj9035@163.com
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \WebBasin\front\src\components\MapView.vue
-->
<template>
  <div>
    <div class="map" id="leafletMap" :style="{ cursor: cursorStyle }"></div>
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
import { request } from "../network/request";
import { eventBus } from "../network/eventBus"; // 导入事件总线
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import "@/assets/js/leaflet.groupedlayercontrol.js";

export default {
  name: 'MapView',
  data() {
    return {
      geoserverBaseUrl: process.env.VUE_APP_GEOSERVER_BASE_URL, // 动态读取环境变量

      cursorStyle: "pointer", // 初始样式为默认指针
      active: "/home",
      mapEl: null,
      baseLayers: null,
      drawingLayerGroup: null,
      mapKeyTDU: "56b0c218a6c4020cd38b5fc2be7c6202",
    }
  },
  created() {
    eventBus.$on("change-cursor", this.changeCursorStyleforCrosshair);
    eventBus.$on("change-cursor-pointer", this.changeCursorStyleforPointer);
  },
  mounted() {
    this.initMap();
    this.initController();
    this.initLayers();
    this.listenDraw();
  },
  updated() {
    // this.$nextTick(() => {
    //   this.active = this.$route.path;
    //   this.$refs.menuActive.updateActiveName();
    // });
  },
  methods: {
    changeCursorStyleforCrosshair() {
      // 当接收到自定义事件时，更改鼠标指针样式为十字
      this.cursorStyle = "crosshair";
    },
    changeCursorStyleforPointer() {
      // 当接收到自定义事件时，更改鼠标指针样式为默认
      this.cursorStyle = "pointer";
    },
    initMap() {
      this.mapEl = L.map('leafletMap', {
        maxZoom:20,
        zoom: 3,
        center: [34, 105],
        crs: L.CRS.TianDiTu_WGS84,
      });
      this.$store.commit("SET_MAP_OBJECT", this.mapEl);
    },
    initController() {
      this.drawingLayerGroup = L.layerGroup([]);
      this.drawingLayerGroup.addTo(this.mapEl);
    },
    initLayers() {
      // 图层控件
      // var mapboxVectorMap = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYm9zaDAxMTMiLCJhIjoiY2tsM3FicnprMTMyZTJvbzRpeXF4Y2ZoOSJ9.JFmrSXBF0bTcqyXXnWjLYQ';
      // var vectorMap = L.tileLayer(mapboxVectorMap, { maxZoom: 18 });
      // var vector = L.layerGroup([vectorMap]);

      // var osmVectorMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      // var osmVectorMap = L.tileLayer(osmVectorMap, { maxZoom: 18 });
      // var vectorOSM = L.layerGroup([osmVectorMap]);

      // var tdtImgMap =
      //     "http://t0.tianditu.gov.cn/img_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
      //     "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      // var tdtImgAno =
      //     "http://t0.tianditu.gov.cn/eia_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
      //     "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=eia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      // var satelliteMap = L.tileLayer(tdtImgMap, {
      //     maxZoom: 18,
      //     attribution:
      //         '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors'
      // });
      // var satelliteAno = L.tileLayer(tdtImgAno, { maxZoom: 18 });
      // var satellite = L.layerGroup([satelliteMap, satelliteAno]);
      // var tdtTerrMap =
      //     "http://t0.tianditu.com/ter_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
      //     "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      // var tdtTerrAno =
      //     "http://t0.tianditu.com/eta_w/wmts?tk=d6b0b78f412853967d91042483385d2c" +
      //     "&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=eta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
      // var terrainMap = L.tileLayer(tdtTerrMap, {
      //     maxZoom: 18,
      //     attribution:
      //         '&copy; <a href="http://map.tianditu.gov.cn/">tianditu</a> contributors'
      // });
      // var terrainAno = L.tileLayer(tdtTerrAno, { maxZoom: 18 });
      // var terrain = L.layerGroup([terrainMap, terrainAno]);
      // this.baseLayers = {
      //     "Mapbox Vector map": vector,
      //     "OSM Vector map": vectorOSM,
      //     "TDT Satellite map": satellite,
      //     "TDT Terrain map": terrain
      // };
      // var overlayLayers = {};
      // L.control.layers(this.baseLayers, overlayLayers).addTo(this.mapEl);
      // this.baseLayers["Mapbox Vector map"].addTo(this.mapEl);

      // // 底图均默认为0层级
      // this.baseLayers["Mapbox Vector map"].setZIndex(0);
      // this.baseLayers["OSM Vector map"].setZIndex(0);
      // this.baseLayers["TDT Satellite map"].setZIndex(0);
      // this.baseLayers["TDT Terrain map"].setZIndex(0);

      // new L.supermap.BaiduTileLayer("", {
      //       noWrap: true
      //   }).addTo(this.mapEl);

      var normalMap = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "vec"
        });
      var normalLable = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "vec",
          isLabel: true
        })
      var imgMap = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "img"
        });
      var imgLable = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "img",
          isLabel: true
        })
      var terrainMap = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "ter"
        });
      var terrainLable = L.supermap.tiandituTileLayer
        ({
          key: this.mapKeyTDU,
          layerType: "ter",
          isLabel: true
        })
      // var TDTWaterSystem = L.tileLayer.wms('http://gisserver.tianditu.gov.cn/TDTService/wfs',{
      //     layers: 'HYDL',
      //     format: 'image/png',
      //     transparent: true,
      //     noWarp:true
      // })
      // var TDTWaterSystem = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/Basin_shp/wms', {
      //   layers: 'asian_4',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true
      // })


      // 河网图层
      var TDTWaterSystems = L.layerGroup()
      
      // console.log(this.geoserverBaseUrl)
      // console.log(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`)
      // // var Level3 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level3_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 2,
      // //   minZoom: 0
      // // }).addTo(TDTWaterSystems)
      // // var Level4 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level4_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 4,
      // //   minZoom: 2
      // // }).addTo(TDTWaterSystems)
      // // var Level5 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level5_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 6,
      // //   minZoom: 4
      // // }).addTo(TDTWaterSystems)
      // // var Level6 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level6_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 8,
      // //   minZoom: 6
      // // }).addTo(TDTWaterSystems)
      // // var Level7 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level7_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 10,
      // //   minZoom: 8
      // // }).addTo(TDTWaterSystems)
      // // var Level8 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level8_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 12,
      // //   minZoom: 10
      // // }).addTo(TDTWaterSystems)
      // // var Level9 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level9_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 14,
      // //   minZoom: 12
      // // })
      // // var Level10 = L.tileLayer.wms('http://210.26.48.56:30123/geoserver/SEIMS/wms', {
      // //   layers: 'Level10_shp',
      // //   format: 'image/png',
      // //   transparent: true,
      // //   noWarp: true,
      // //   maxZoom: 18,
      // //   minZoom: 13
      // // }).addTo(TDTWaterSystems)

      // // 服务器
      var Aasia_river_10 = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: 'SEIMS:asia_river_10',
        format: 'image/png',
        transparent: true,
        noWarp: true,
        // maxZoom: 18,
        // minZoom: 13
      }).addTo(TDTWaterSystems)
      var Northamerica_river_10_shp = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: 'SEIMS:northamerica_river_10_shp',
        format: 'image/png',
        transparent: true,
        noWarp: true,
        // maxZoom: 18,
        // minZoom: 13
      }).addTo(TDTWaterSystems)

      var Southamerica_river_10_shp = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: 'SEIMS:southamerica_river_10_shp',
        format: 'image/png',
        transparent: true,
        noWarp: true,
        // maxZoom: 18,
        // minZoom: 13
      }).addTo(TDTWaterSystems)

      var Africa_river_12_shp = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: 'SEIMS:africa_river_12_shp',
        format: 'image/png',
        transparent: true,
        noWarp: true,
        // maxZoom: 18,
        // minZoom: 13
      }).addTo(TDTWaterSystems)

      var Europe_river_10_shp = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: 'SEIMS:europe_river_10_shp',
        format: 'image/png',
        transparent: true,
        noWarp: true,
        // maxZoom: 18,
        // minZoom: 13
      }).addTo(TDTWaterSystems)

      // 本地
      // var local_Level3 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:Level3',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 2,
      //   minZoom: 0
      // }).addTo(TDTWaterSystems)
      // var local_Level4 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:Level4',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 4,
      //   minZoom: 2
      // }).addTo(TDTWaterSystems)
      // var local_Level5 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:Level5',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 6,
      //   minZoom: 4
      // }).addTo(TDTWaterSystems)
      // var local_Level6 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:asia_river_6_shp',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 8,
      //   minZoom: 6
      // }).addTo(TDTWaterSystems)
      // var local_Level7 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:asia_river_7_shp',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 10,
      //   minZoom: 8
      // }).addTo(TDTWaterSystems)
      // var local_Level8 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:asia_river_8_shp',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 12,
      //   minZoom: 10
      // }).addTo(TDTWaterSystems)
      // var local_Level9 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:asia_river_9_shp',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 14,
      //   minZoom: 12
      // })
      // var local_Level10 = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: 'SEIMS:Level10_shp',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      //   maxZoom: 18,
      //   minZoom: 13
      // }).addTo(TDTWaterSystems)

      // 湖泊图层
      var TDTLakeSystems = L.layerGroup()
      // 本地
      // var HydroLakes = L.tileLayer.wms('http://localhost:8080/geoserver/SEIMS/wms', {
      //   layers: '	SEIMS:HydroLAKES_polys_v10',
      //   format: 'image/png',
      //   transparent: true,
      //   noWarp: true,
      // }).addTo(TDTLakeSystems)

      // 服务器
      var HydroLakes = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: '	SEIMS:HydroLAKES_polys_v10',
        format: 'image/png',
        transparent: true,
        noWarp: true,
      }).addTo(TDTLakeSystems)


      var TDTGlacierSystems = L.layerGroup()
      var RVIGlacier = L.tileLayer.wms(`${this.geoserverBaseUrl}/geoserver/SEIMS/wms`, {
        layers: '	SEIMS:glacier_global',
        format: 'image/png',
        transparent: true,
        noWarp: true,
      }).addTo(TDTGlacierSystems)

      //图层与注记合并
      var normal = L.layerGroup([normalMap, normalLable]);
      var img = L.layerGroup([imgMap, imgLable]);
      var terrain = L.layerGroup([terrainMap, terrainLable]);
      this.baseLayers = {
        "Vector map": normal,
        "Image map": img,
        "Topographic map": terrain
      };
      var overlayLayers = {
        "River": TDTWaterSystems,
        "Lake": TDTLakeSystems,
        "Glacier":TDTGlacierSystems
      };
      L.control.layers(this.baseLayers, overlayLayers).addTo(this.mapEl);
      this.baseLayers["Vector map"].addTo(this.mapEl);

      //   // 底图均默认为0层级
      this.baseLayers["Vector map"].setZIndex(0);
      this.baseLayers["Image map"].setZIndex(0);
      this.baseLayers["Topographic map"].setZIndex(0);
      // 比例尺
      L.control
        .scale({
          position: "bottomright"
        })
        .addTo(this.mapEl);
      // 绘图控件
      var options = {
        position: "topleft", // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
        drawMarker: false, // adds button to draw markers
        drawPolyline: false, // adds button to draw a polyline
        drawRectangle: true, // adds button to draw a rectangle
        drawPolygon: true, // adds button to draw a polygon
        drawCircle: false, // adds button to draw a cricle
        cutPolygon: false, // adds button to cut a hole in a polygon
        editMode: true, // adds button to toggle edit mode for all layers
        dragMode: false,
        removalMode: true // adds a button to remove layers
      };
      //   this.mapEl.pm.addControls(options);
      let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [24, 36],
        iconAnchor: [12, 36]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      //   var groupedOverlays = {
      //     "地图注记": {
      //       "矢量地图注记": ExampleData.LayerGroups.cities,
      //       "Restaurants": ExampleData.LayerGroups.restaurants
      //     },
      //     "Random": {
      //       "Dogs": ExampleData.LayerGroups.dogs,
      //       "Cats": ExampleData.LayerGroups.cats
      //     }
      //   };

      // // Use the custom grouped layer control, not "L.control.layers"
      // L.control.groupedLayers(ExampleData.Basemaps, groupedOverlays).addTo(map);

    },
    //弃用，放到createmodel组件中
    listenDraw() {
      var _this = this;
      this.mapEl.on('pm:create', e => {
        _this.showDownloadGeoJSONBtn = false;
        _this.drawingLayerGroup.clearLayers();
        _this.drawingLayerGroup.addLayer(e.layer);
      });
      this.mapEl.on('pm:remove', e => {
        _this.showDownloadGeoJSONBtn = false;
        _this.drawingLayerGroup.clearLayers();
      });
      this.mapEl.on('click', e => {
        if (_this.querySwitch) {
          var latlng = e.latlng
          var lon = latlng['lng'];
          var lat = latlng['lat'];
          var baseUrl = "";
          //   this.removeUpstreamClickPoint();
          switch (_this.queryType) {
            case "standard": {
              //各级流域范围接口待补充
              // baseUrl = "/basins/querySubLevel/" + this.levelSelectQuery;
              baseUrl = "/basins/querySubLevel/" + this.levelSelect + "?lon=" + lon + "&lat=" + lat;
              break;
            }
            case "upstream": {
              //水体上游范围接口待补充
              baseUrl = "/basins/upstream";
              break;
            }
            case "pointupstream": {
              //任一点上游范围接口
              var timestamp = new Date().getTime();
              _this.downloadUpstreamTimestamp = timestamp;
              baseUrl = "/basins/queryUpstreamBasin/" + this.levelSelect + "?lon=" + lon + "&lat=" + lat +
                "&dir=" + this.upstreamDir + "&upa=" + this.upstreamUpa + "&elv=" + this.upstreamElv + "&timeStamp=" + timestamp;
              this.addUpstreamClickPoint(lon, lat);
              break;
            }
            case "whole": {
              //临时写法
              baseUrl = "/basins/queryScope"
            }
          }
          this.$Spin.show();
          request
            .get(baseUrl)
            .then(res => {
              if (res.data != 0) {
                var tempGeoJSON = res.data;
                _this.showDownloadGeoJSONBtn = true;
                _this.toDownloadGeoJSONStr = tempGeoJSON;
                _this.addGeoJSONToMap(JSON.stringify(tempGeoJSON), "red");
                _this.$Spin.hide();
              }
              else {
                _this.$Message.error('No Basin Info Here.');
                _this.$Spin.hide();
              };
            })
            .catch(err => {
              confirm('Something Wrong!');
              _this.$Spin.hide();
            });
          // this.showDownloadGeoJSONBtn = true;
          // this.toDownloadGeoJSONStr = basin_scale;
          // this.addGeoJSONToMap(JSON.stringify(basin_scale), "red");

        }
      });
    },
  },
}

</script>
<style scoped src="../assets/css/leaflet.groupedlayercontrol.css"></style>
<style scoped>
.map {
  height: calc(100vh - 67px);
  /* height: calc(100vh - 86px); */
}

/* 定义自定义鼠标指针样式 */
.custom-cursor {
  cursor: crosshair;
}
</style>
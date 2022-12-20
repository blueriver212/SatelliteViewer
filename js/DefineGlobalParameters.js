Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjODcyZDRmZC03ZmUzLTQwNTktOTM4Mi1jMmI0OWIwODY2NDkiLCJpZCI6NTcwMTcsImlhdCI6MTYyMTk2ODM2NH0.lzeb9LrtQ6y3uotDuKUN3djp1kz-4o5BMq5c8uIe_tU';

var viewer_main = new Cesium.Viewer('cesiumContainer', {
    terrainProvider : Cesium.createWorldTerrain(),
    shouldAnimate: true,
});

var radar_viewer, viewer_hotspot;
var viewer2;
var start_jd;
var clockViewModel; 
var data_load=false;
var data_load2 = false;
var debris_collection = new Cesium.PointPrimitiveCollection();
var debris_collection2;
var satcat = new Catalogue();
var satcat2;
var count = 0;
var one_year_clicked = false;
var two_year_clicked = false;
var hotspot_data = false;
var colour; 


var options3D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : false,
  clockViewModel : clockViewModel,
  infoBox : false,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE3D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};

var options2D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : true,
  clockViewModel : clockViewModel,
  infoBox : true,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE2D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};
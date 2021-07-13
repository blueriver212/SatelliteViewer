const { viewerCesium3DTilesInspectorMixin } = require("cesium");

function twoYear () {
    removeMapData();
    
    
    var viewer2 = new Cesium.Viewer('cesiumContainer', {
        skyBox : false,
        skyAtmosphere : false,
        baseLayerPicker : false,
        bottomContainer: false,
        imageryProvider :new Cesium.SingleTileImageryProvider({
            url : './images/2016c.jpg'
        })
    });

    // viewer.dataSources.add(Cesium.GeoJsonDataSource.load('USA.json', {
    //     stroke: Cesium.Color.HOTPINK, 
    //     fill: Cesium.Color.PINK,
    //     strokeWidth: 3
    // }))

    
    viewer.dataSources.add(Cesium.GeoJsonDataSource.load('USA.json', {
            stroke: Cesium.Color.HOTPINK, 
            fill: Cesium.Color.PINK,
            strokeWidth: 3
        }))

    
    var layers = viewer.imageryLayers;
    var blackMarble = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                url : '2012.jpg'
            }),1);

    blackMarble.splitDirection = Cesium.ImagerySplitDirection.RIGHT;
    
    
    
    
    
    
    
    
    
    
    
    
    
    var slider = document.getElementById('slider');
    
    // need to change the z index of the slider 
    document.getElementById('slider').style.zIndex = "2000";
    
    viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth;

    var handler = new Cesium.ScreenSpaceEventHandler(slider);

    var bMoveActive = false;

    function move(movement){
      if(!bMoveActive)
          return;

      var nMove = movement.endPosition.x ;//- movement.startPosition.x;
      var splitPosition = (slider.offsetLeft + nMove) / slider.parentElement.offsetWidth;
      slider.style.left = 100.0 * splitPosition + "%";
      viewer.scene.imagerySplitPosition = splitPosition;
    }

    handler.setInputAction(function(movement) {
          bMoveActive = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function(movement) {
          bMoveActive = true;
      }, Cesium.ScreenSpaceEventType.PINCH_START);

      handler.setInputAction(function(movement) {
          move(movement);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function(movement) {
          move(movement);
      }, Cesium.ScreenSpaceEventType.PINCH_MOVE);

      handler.setInputAction(function(movement) {
          bMoveActive = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function(movement) {
          bMoveActive = false;
      }, Cesium.ScreenSpaceEventType.PINCH_END);



}
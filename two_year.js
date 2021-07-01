function twoYear () {
    removeMapData();

    var slider = document.getElementById('slider');
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


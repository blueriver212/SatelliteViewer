function hotspotData () {
    removeMapData();
    // remove the slider
    document.getElementById('slider').style.zIndex = "-1";

    // viewer_main.dataSources.add(
    // Cesium.GeoJsonDataSource.load(
    //   "../hex2.geojson",
    //   {
    //     stroke: Cesium.Color.HOTPINK,
    //     fill: Cesium.Color.PINK.withAlpha(0.5),
    //     fill: Cesium.Color.TRANSPARENT,
    //     strokeWidth: 3,
    //   }
    // ))

    var promise = Cesium.GeoJsonDataSource.load( "../hex1.geojson");

    promise.then(function(dataSource) {
      viewer_main.dataSources.add(dataSource);

      //var entities = dataSource.entities.features.Join_Count;
      console.log(dataSource.entities);
    }).otherwise(function (error) {
      
      //Display any errrors encountered while loading.
      window.alert(error);
    });
}
function single_year () {
    // Initialize the Cesium Viewer in the HTML element with the "cesiumContainer" ID.
        const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain()
        });    

        viewer.dataSources.add(
        Cesium.GeoJsonDataSource.load(
          "../USA.json",
          {
            stroke: Cesium.Color.HOTPINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 3,
          }
        )
      );
}

function two_year () {
  // adding a comment
    const viewer_compare = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain()
        }); 
}

function removeMapData () {
  viewer.dataSources.removeAll();
  console.log('ive been clicked');
}
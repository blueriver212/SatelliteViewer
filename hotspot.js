function hotspotData () {
    removeMapData();

    viewer.dataSources.add(
    Cesium.GeoJsonDataSource.load(
      "../hex1.geojson",
      {
        stroke: Cesium.Color.HOTPINK,
        fill: Cesium.Color.PINK.withAlpha(0.5),
        fill: Cesium.Color.TRANSPARENT,
        strokeWidth: 3,
      }
    ))
}
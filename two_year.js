function twoYear () {

    two_year_clicked = true;

    // bring the search bar to the front
    document.getElementById('button2year').style.zIndex = 9999;
    
    
    viewer2 = new Cesium.Viewer('cesiumContainer', {
        skyBox : false,
        skyAtmosphere : false,
        baseLayerPicker : false,
        bottomContainer: false,
        imageryProvider :new Cesium.SingleTileImageryProvider({
            url : './2016c.jpg'
        })
    });

    
    viewer2.dataSources.add(Cesium.GeoJsonDataSource.load('USA.json', {
            stroke: Cesium.Color.HOTPINK, 
            fill: Cesium.Color.PINK,
            strokeWidth: 3
        }))


}
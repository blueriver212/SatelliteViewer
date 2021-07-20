function removeSatellites() {
  //this is only for when the hotspot maps are clicked on
  if (count > 1) {
    satcat.clear_catalog();
    data_load = false;
    debris_collection.removeAll();
    debri_collection_radar.removeAll();
  }

    // remove the double screen
    if (two_year_clicked = true) {
      viewer2.entities.removeAll()
      viewer2.destroy();
      document.getElementById('button2year').style.zIndex = -100;
    }
  
}

function hotspotData () {
    console.log('no');

    two_year_clicked = false;

    removeSatellites();
  
    // hotspot_data = true; // set this to true

    // var promise = Cesium.GeoJsonDataSource.load( "../hex/hex2.geojson");

    // promise.then(function(dataSource) {
    //   viewer_main.dataSources.add(dataSource);
    //   var entities = dataSource.entities.values;
    //   var colorhash = {};


    //   console.log(entities.length);
      
      
    //   for (var i = 0; i < entities.length; i++) {
    //     var entity = entities[i];
    //     //console.log(entity.properties);
    //     //console.log(entity.properties.Join_Count._value);
    //     // need the id of the variable to be able to loop back
    //     var ID = entity.properties.OBJECTID._value;
    //     var color = colorhash[ID];
    //     var outcolor;
    //     var satellite_num = entity.properties.Join_Count._value;

    //     if (!color) {
    //       if (satellite_num < 5) {
    //         color = Cesium.Color.FORESTGREEN.withAlpha(0.7);
    //         outcolor = Cesium.Color.FORESTGREEN.withAlpha(1.0);
    //         colorhash[ID] = color;
    //       }
    //       else if (satellite_num >= 5 && satellite_num < 10) {
    //         color = Cesium.Color.GOLD.withAlpha(0.7);
    //         outcolor = Cesium.Color.GOLD.withAlpha(1.0);
    //         colorhash[ID] = color;
    //       }

    //       else if (satellite_num >= 10 && satellite_num < 15) {
    //         color = Cesium.Color.ORANGE.withAlpha(0.7);
    //         outcolor = Cesium.Color.ORANGE.withAlpha(1.0);
    //         colorhash[ID] = color;
    //       } 
          
    //       else if (satellite_num >= 15 && satellite_num < 20) {
    //         color = Cesium.Color.DARKORANGE.withAlpha(0.7);
    //         outcolor = Cesium.Color.DARKORANGE.withAlpha(1.0);
    //         colorhash[ID] = color;
    //       } 

    //       else if (satellite_num >= 20 ) {
    //         color = Cesium.Color.RED.withAlpha(0.7);
    //         outcolor = Cesium.Color.RED.withAlpha(1.0);
    //         colorhash[ID] = color;
    //       } 

    //     }

    //     entity.polygon.material = color;
    //     entity.polygon.outlineColor = outcolor;
    //     entity.polygon.extrudedHeight = entity.properties.num * 50000;


    //   }
    //   //var entities = dataSource.entities.features.Join_Count;
    //   //console.log(dataSource.entities.values);
    // }).otherwise(function (error) {
      
    //   //Display any errrors encountered while loading.
    //   window.alert(error);
    // });
  //} // end of else statement

} // end of function
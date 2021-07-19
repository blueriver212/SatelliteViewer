var viewer_main, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection

var satcat;


function removeOtherData() {
  // this should be run when the user clicks just on the button from another web page
  
  // for the double screen


  
  // for the hotspot data
  if (hotspotData = true) {
    viewer_main.dataSources.removeAll();
  }
}

function numberOfLoads() {
  removeOtherData();
  count = count + 1; 
  console.log(count);


  if (count >= 2) {
    // viewer_main.scene.postUpdate.removeEventListener(update_debris_position);
    // viewer_main.scene.primitives.remove(debris_collection);
    // oneYearLoad();
      satcat.clear_catalog();
      data_load = false;
      debris_collection.removeAll();
      debri_collection_radar.removeAll();
      oneYearLoad();
  } else {
    oneYearLoad();
  }

}
function oneYearLoad() {

    satcat = new Catalogue();

    // get the user's year from the search box
    var userOneYear = document.getElementById('1yearsearch').value;

    type="test";
    satcat_logfile="http://satellite-api.herokuapp.com/"+userOneYear+"";

    satcat.loadcatlog(type,satcat_logfile);
    
    clockViewModel = new Cesium.ClockViewModel();
 
     //Enable depth testing so things behind the terrain disappear.
     viewer_main.scene.globe.depthTestAgainstTerrain = true;
 
         
    viewer_main.globe = true;
    viewer_main.scene.globe.enableLighting = true;
    viewer_main.clock.multiplier =  100 ;               // speed of the simulation
     
     var mycredit= new Cesium.Credit("Space Geodesy and Navigation Laboratory",'data/sgnl.png','https://www.ucl.ac.uk');
     // var mycredit = new Cesium.Credit('Cesium', 'data/sgnl.png', 'https://www.ucl.ac.uk');
     viewer_main.scene.frameState.creditDisplay.addDefaultCredit(mycredit);
     viewer_main.CreditDisplay = true;
     viewer_main.scene.debugShowFramesPerSecond = true;
     viewer_main.scene.frameState.creditDisplay.removeDefaultCredit();
 
     start_jd = Cesium.JulianDate.now();
     //start_jd = Cesium.JulianDate.fromIso8601("2019-01-01T13:00:00Z");
     viewer_main.clock.startTime = Cesium.JulianDate.now(); ///It is in system loal time
     viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
     viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
 
          
     /// debris_collection to store all the debris points
     debris_collection = new Cesium.PointPrimitiveCollection();
     debri_collection_radar = new Cesium.PointPrimitiveCollection();
     //By seting the blendOption to OPAQUE can improve the performance twice
     debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;
 
     /// add debris_collection to the viewer_main
     /// should organize debris in different orbtis to different collections
     debris_collection = viewer_main.scene.primitives.add(debris_collection);
     debris_collection.blendOption=Cesium.BlendOption.OPAQUE;
 
     var colour = Cesium.Color.YELLOW;
     
     /// a timer is used to deal with the async reading of JSON
     var timename=setInterval(function(){
       if(satcat.data_load_complete == true
         && data_load == false)
         {
           //ShowDebris(viewer_main,mycatlog,4);
           console.log(satcat.getNumberTotal());
           for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) 
           {
 
             var operation_status = satcat.getDebriOperation_status(debrisID);
             if (operation_status > 0.0) 
             {
               colour = Cesium.Color.YELLOW;
             }
             else
             {
               colour = Cesium.Color.RED;
             }
 
             debris_collection.add({
             id: satcat.getDebriName([debrisID]),
             position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
             pixelSize: 3,
             color: colour
             });  
 
           }
 
           data_load=true;
           // clearInterval(timename); /// clear itself
           }
    
          //  viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
          //  viewer_main.scene.preRender.addEventListener(update_debris_position);
          //  viewer_main.scene.postUpdate.addEventListener(update_debris_position);
    
     },1000); /// allow sometime to load the Earth 
 
     viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
     //viewer_main.scene.preRender.addEventListener(update_debris_position);
     viewer_main.scene.postUpdate.addEventListener(update_debris_position);
  }


var viewer_main, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection


function removeOtherData() {
  // this should be run when the user clicks just on the button from another web page
  
  // for the double screen
  if (two_year_clicked == true) {
    //viewer2.removeAll()
    viewer2.destroy();
    document.getElementById('button2year').style.zIndex = -100;
  }

  // for the hotspot data
  if (hotspotData == true) {
    
  }
}

function numberOfLoads() {
  two_year_clicked = false;
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
  } 
  else {
    oneYearLoad();
    document.getElementById('1yearsearch').value = '2019';
  }

  if (hotspot_data == true) {
    viewer_main.dataSources.removeAll();
  } 

}

function oneYearLoad() {

    satcat = new Catalogue();

    // get the user's year from the search box
    var userOneYear = document.getElementById('1yearsearch').value;
    var satcat_logfile = getURL(userOneYear);
    
    type="test";
    //satcat_logfile="http://satellite-api.herokuapp.com/"+userOneYear+"";
    

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
 
     //var colour = Cesium.Color.YELLOW;
    var colour; 
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
               //console.log(operation_status);
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


//function update_debris_position(debris_set, viewer,mycatlog)
function update_debris_position()
{
    var debris_set = debris_collection;
    var viewer = viewer_main;
    var mycatlog = satcat;

    time = viewer.clock.currentTime; /// the current computer time in TAI? not in UTC?
    var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
    
    var time_utc = Cesium.JulianDate.now();
    Cesium.JulianDate.addSeconds(time, tai_utc, time_utc); // often modified julian date, as it is a smaller number 6 digits before dp

    // var t1_now = Cesium.JulianDate.now();
    // var t2_now = Date.now();

    var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
    var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()
    
    
    var position_ecef = new Cesium.Cartesian3();
    var points = debris_set._pointPrimitives;
    var length = points.length;

    // if (length > 0)
    // {
    //   console.log("point number in debris_set._pointPrimitives is loaded!");
    // }

    var pos_radar_view = new Cesium.Cartesian3();

    for (var i = 0; i < length; ++i) 
    {
      var point = points[i];
      //Cesium.Cartesian3.clone(point.position, position_ecef);
      ///compute the position of debris according to time
      if (Cesium.defined(icrfToFixed)) // date transformation
      {
        var positionAndVelocity = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
        
        var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x*1000,positionAndVelocity.position.y*1000,positionAndVelocity.position.z*1000);
        
        position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);
        
        Cesium.Cartesian3.clone(position_ecef,pos_radar_view);

        point.position = position_ecef; //// update back
        
      }
  }
}

function icrf_view_main(scene, time) 
{
  if (scene.mode !== Cesium.SceneMode.SCENE3D) 
  {
      return;
  }
  var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
  if (Cesium.defined(icrfToFixed)) 
  {
      var camera = viewer_main.camera;
      var offset = Cesium.Cartesian3.clone(camera.position);
      var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
      camera.lookAtTransform(transform, offset);
  }
}


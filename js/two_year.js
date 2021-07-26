var twoYearcount = 0;

var viewer2;
var start_jd2;

var clockViewModel2; /// the clockmodel for synchronisation of two views
var data_load2=false;
var debris_collection2;
var debri_collection_radar2; 

function twoYear () {

    // this will stop more cesium containers opening every time 'Compare 2 Years' is clicked
    two_year_clicked = true;
    twoYearcount = twoYearcount + 1;


    if (document.getElementById('button1year').style.zIndex = -9999) {
      document.getElementById('button1year').style.zIndex = 9999;
      document.getElementById('hotspot_toolbar').style.zIndex = -9990;  

    }

    // bring the search bar to the front
    document.getElementById('button2year').style.zIndex = 9990;
    
    try {viewer2 = new Cesium.Viewer('cesiumContainer', {
        skyBox : false,
        skyAtmosphere : false,
        baseLayerPicker : false,
        bottomContainer: false
    });
  } catch (err) {console.log(err)};

  try {viewer_main.dataSources.removeAll()} catch(err) {console.log(err)};
 
}

function icrf_view_main2(scene, time) 
{
  if (scene.mode !== Cesium.SceneMode.SCENE3D) 
  {
      return;
  }
  var icrfToFixed2 = Cesium.Transforms.computeIcrfToFixedMatrix(time);
  if (Cesium.defined(icrfToFixed2)) 
  {
      var camera = viewer2.camera;
      var offset = Cesium.Cartesian3.clone(camera.position);
      var transform2 = Cesium.Matrix4.fromRotationTranslation(icrfToFixed2);
      camera.lookAtTransform(transform2, offset);
  }
}


function update_debris_position2()
{
    var debris_set = debris_collection2;
    var mycatlog = satcat2;

    time = viewer2.clock.currentTime; /// the current computer time in TAI? not in UTC?
    var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
    
    var time_utc = Cesium.JulianDate.now();
    Cesium.JulianDate.addSeconds(time, tai_utc, time_utc); // often modified julian date, as it is a smaller number 6 digits before dp

    var icrfToFixed2 = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
    var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()
    
    
    var position_ecef2 = new Cesium.Cartesian3();
    var points = debris_set._pointPrimitives;
    var length = points.length;


    var pos_radar_view2 = new Cesium.Cartesian3();

    for (var i = 0; i < length; ++i) 
    {
      var point = points[i];
   
      if (Cesium.defined(icrfToFixed2)) // date transformation
      {
        var positionAndVelocity2 = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
        
        var position_eci2 = new Cesium.Cartesian3(positionAndVelocity2.position.x*1000,positionAndVelocity2.position.y*1000,positionAndVelocity2.position.z*1000);
        
        position_ecef2 = Cesium.Matrix3.multiplyByVector(icrfToFixed2, position_eci2, position_ecef2);
        
        Cesium.Cartesian3.clone(position_ecef2,pos_radar_view2);

        point.position = position_ecef2; //// update back
        
      }
  }
}

var count2 = 0;

function addSecondYearSatelliteData() {

  count2 = count2 + 1;

  if (count2 >= 2) {
    // viewer_main.scene.postUpdate.removeEventListener(update_debris_position);
    // viewer_main.scene.primitives.remove(debris_collection);
    // oneYearLoad();
      satcat2.clear_catalog();
      data_load2 = false;
      debris_collection2.removeAll();
      // debri_collection_radar2.removeAll();
      twoYearLoads();
  } else {
    twoYearLoads();
  }

  
}

function twoYearLoads() {
  
    
    satcat2 = new Catalogue();

    // get the user's year from the search box
    var userOneYear = document.getElementById('button2yearval').value;

    type="test";
    //satcat_logfile="http://satellite-api.herokuapp.com/"+userOneYear+"";
    satcat_logfile = getURL(userOneYear);

    satcat2.loadcatlog(type,satcat_logfile);
    
    clockViewModel2 = new Cesium.ClockViewModel();
 
     //Enable depth testing so things behind the terrain disappear.
     viewer2.scene.globe.depthTestAgainstTerrain = true;
 
         
    viewer2.globe = true;
    viewer2.scene.globe.enableLighting = true;
    viewer2.clock.multiplier =  100 ;               // speed of the simulation
     
     var mycredit= new Cesium.Credit("Space Geodesy and Navigation Laboratory",'data/sgnl.png','https://www.ucl.ac.uk');
     // var mycredit = new Cesium.Credit('Cesium', 'data/sgnl.png', 'https://www.ucl.ac.uk');
     viewer2.scene.frameState.creditDisplay.addDefaultCredit(mycredit);
     viewer2.CreditDisplay = true;
     viewer2.scene.debugShowFramesPerSecond = true;
     viewer2.scene.frameState.creditDisplay.removeDefaultCredit();
 
     start_jd2 = Cesium.JulianDate.now();
     //start_jd = Cesium.JulianDate.fromIso8601("2019-01-01T13:00:00Z");
     viewer2.clock.startTime = Cesium.JulianDate.now(); ///It is in system loal time
     viewer2.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
     viewer2.timeline.zoomTo(start_jd2, Cesium.JulianDate.addSeconds(start_jd2, 86400, new Cesium.JulianDate()));
 
          
     /// debris_collection2 to store all the debris points
     debris_collection2 = new Cesium.PointPrimitiveCollection();
    //  debri_collection_radar = new Cesium.PointPrimitiveCollection();
    //  //By seting the blendOption to OPAQUE can improve the performance twice
    //  debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;
 
     /// add debris_collection2 to the viewer2
     /// should organize debris in different orbtis to different collections
     debris_collection2 = viewer2.scene.primitives.add(debris_collection2);
     debris_collection2.blendOption=Cesium.BlendOption.OPAQUE;
 
     var colour = Cesium.Color.YELLOW;
     
     /// a timer is used to deal with the async reading of JSON
     var timename=setInterval(function(){
       if(satcat2.data_load_complete == true
         && data_load2 == false)
         {
           //ShowDebris(viewer2,mycatlog,4);
           console.log(satcat2.getNumberTotal());
           for (var debrisID = 0; debrisID < satcat2.getNumberTotal(); debrisID++) 
           {
 
             var operation_status = satcat2.getDebriOperation_status(debrisID);
             if (operation_status > 0.0) 
             {
               colour = Cesium.Color.YELLOW;
             }
             else
             {
               colour = Cesium.Color.RED;
             }
 
             debris_collection2.add({
             id: satcat2.getDebriName([debrisID]),
             position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
             pixelSize: 3,
             color: colour
             });  
 
           }
 
           data_load2=true;
           // clearInterval(timename); /// clear itself
           }

     },1000); /// allow sometime to load the Earth 
 
     viewer2.scene.postUpdate.addEventListener(icrf_view_main2); // enable Earth rotation, everything is seen to be in eci
     //viewer2.scene.preRender.addEventListener(update_debris_position);
     viewer2.scene.postUpdate.addEventListener(update_debris_position2);


}
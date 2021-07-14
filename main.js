// author: Zhen Li
// email: hpulizhen@163.com

// Grant CesiumJS access to your ion assets

// Z. Li's Cesium ion access token
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';

// S. Bhattarai's Cesium ion access token
//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzVhMjQ1MS1iZjIxLTQxNTctODA2Yi1mOTJmNDkwYzU2MWUiLCJpZCI6OTczMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDgxNDUzN30.5gySU1UpdweOzztxyf6KbIqYc-hR_yfgo5aEGLgGPDc';

// var viewer, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection

var satcat;
var data_path="data/";


var options3D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : false,
  clockViewModel : clockViewModel,
  infoBox : false,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE3D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};

var options2D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : true,
  clockViewModel : clockViewModel,
  infoBox : true,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE2D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};


function icrf_view_main(scene, time) 
{
  if (scene.mode !== Cesium.SceneMode.SCENE3D) 
  {
      return;
  }
  var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
  if (Cesium.defined(icrfToFixed)) 
  {
      var camera = viewer.camera;
      var offset = Cesium.Cartesian3.clone(camera.position);
      var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
      camera.lookAtTransform(transform, offset);
  }
}

// function icrf_radar(scene, time) 
// {
//   if (scene.mode !== Cesium.SceneMode.SCENE3D) 
//   {
//       return;
//   }
//   var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
//   if (Cesium.defined(icrfToFixed)) 
//   {
//       var camera = radar_viewer.camera;
//       var offset = Cesium.Cartesian3.clone(camera.position);
//       var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
//       camera.lookAtTransform(transform, offset);
//   }
// }







// // define callback functions
// var prepareScreenshot = function(){
//   var canvas = scene.canvas;    
//   viewer.resolutionScale = targetResolutionScale;
//   scene.preRender.removeEventListener(prepareScreenshot);
//   // take snapshot after defined timeout to allow scene update (ie. loading data)
//   setTimeout(function(){
//       scene.postRender.addEventListener(takeScreenshot);
//   }, timeout);
// }

// var takeScreenshot = function(){    
//   scene.postRender.removeEventListener(takeScreenshot);
//   var canvas = scene.canvas;
//   canvas.toBlob(function(blob){
//       var url = URL.createObjectURL(blob);
//       downloadURI(url, "snapshot-" + targetResolutionScale.toString() + "x.png");
//       // reset resolutionScale
//       viewer.resolutionScale = 1.0;
//   });
// }

// function downloadURI(uri, name) {
//   var link = document.createElement("a");
//   link.download = name;
//   link.href = uri;
//   // mimic click on "download button"
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   delete link;
// }



function ecef2blh(x_ecef,y_ecef,z_ecef)
{
  //var ellipsoid_wgs84 = Cesium.Ellipsoid.WGS84;
	var FE_WGS84 = (1.0/298.257223563);
	var	RE_WGS84 = 6378137.0;
	var	PI = Math.PI;
	var e2=FE_WGS84*(2.0-FE_WGS84);
	var	r2=x_ecef*x_ecef + y_ecef*y_ecef,z,zk,v=RE_WGS84,sinp;
	for(z=z_ecef,zk=0.0;Math.abs(z-zk)>=1E-4;)
	{
		zk=z;
		sinp=z/Math.sqrt(r2+z*z);
		v=RE_WGS84/Math.sqrt(1.0-e2*sinp*sinp);
		z=z_ecef+v*e2*sinp;
  }
  var blh = new Array();
	blh[0]=r2>1E-12?Math.atan(z/Math.sqrt(r2)):(z_ecef>0.0?Math.PI/2.0:-Math.PI/2.0);
	blh[1]=r2>1E-12?Math.atan2(y_ecef,x_ecef):0.0;
  blh[2]=Math.sqrt(r2+z*z)-v;
  return blh;
	}



function xyz2enu_matrix(lat,lon)
{
    var E = new Array(9);
    var sinp=Math.sin(lat),cosp=Math.cos(lat),sinl=Math.sin(lon),cosl=Math.cos(lon);
    E[0]=-sinl;      E[1]=cosl;       E[2]=0.0;
    E[3]=-sinp*cosl; E[4]=-sinp*sinl; E[5]=cosp;
    E[6]=cosp*cosl;  E[7]=cosp*sinl;  E[8]=sinp;
    return E;
}

/** simulate the radar screen*/
// function radar_screen(radar_position_ecef)
// {

//   // var blh = ecef2blh(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z );
//   // var ecef_enu = xyz2enu_matrix(blh[0],blh[1]);

//   /// set the position of the radar
//   radar_viewer.camera.position = radar_position_ecef;// new Cesium.Cartesian3(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z);
  
//   var ellipsoid_wgs84 = Cesium.Ellipsoid.WGS84;
//   var normal_ecef = ellipsoid_wgs84.geodeticSurfaceNormal(radar_position_ecef);


//   // /// camera_target in NEU
//   var length = 1.0;
//   var ele = 60/180.0*Cesium.Math.PI;
//   var azi = 90/180.0*Cesium.Math.PI;
//   var E = length*Math.cos(ele)*Math.sin(azi);
//   var N = length*Math.cos(ele)*Math.cos(azi);
//   var U = length*Math.sin(ele);
  
//   var camera_target_enu = new Cesium.Cartesian3(E, N, U);
//   var camera_target_ecef = new Cesium.Cartesian3();
//   // /// set the radar direction, azimuth and elevation
//   var transform_enu2ecef = Cesium.Transforms.eastNorthUpToFixedFrame(radar_position_ecef);
//   camera_target_ecef = Cesium.Matrix4.multiplyByPointAsVector(transform_enu2ecef,camera_target_enu,camera_target_ecef);
  
//   //var transform_enu2ecef = new Cesium.Matrix3();
//   //Cesium.Matrix3.fromColumnMajorArray(ecef_enu, transform_enu2ecef);
//   //camera_target_ecef = Cesium.Matrix3.multiplyByVector(transform_enu2ecef,camera_target_enu,camera_target_ecef);

  
  
//   /// how to define the Up of image plane
//   camera_target_ecef = Cesium.Cartesian3.normalize(camera_target_ecef, camera_target_ecef);
//   radar_viewer.camera.direction = camera_target_ecef;
//   var normal_tmp = new Cesium.Cartesian3();
//   var camera_up = new Cesium.Cartesian3();
//   normal_tmp = Cesium.Cartesian3.cross(normal_ecef,camera_target_ecef,normal_tmp);
//   camera_up  = Cesium.Cartesian3.cross(camera_target_ecef,normal_tmp,camera_up);
//   radar_viewer.camera.up = camera_up;

//   radar_viewer.camera.frustum.fov = 60/180* Cesium.Math.PI; /// field of view
//   radar_viewer.camera.frustum.near = 0.1;
//   radar_viewer.camera.frustum.far = 20000000.0;
//   radar_viewer.camera.frustum.aspectRatio = radar_viewer.scene.canvas.clientWidth/radar_viewer.scene.canvas.clientHeight;

  
//   // View in east-north-up frame
//   // var camera = viewer.camera;
//   // camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
//   // camera.lookAtTransform(transform, new Cesium.Cartesian3(-120000.0, -120000.0, 120000.0));
//   // // Show reference frame.  Not required.
//   // referenceFramePrimitive = radar_viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
//   //     modelMatrix : radar_viewer.camera.transform,
//   //     length : 1000000.0
//   // }));

// }


//function update_debris_position(debris_set, viewer,mycatlog)
function update_debris_position()
{
    var debris_set = debris_collection;
    //var viewer = viewer;
    var mycatlog = satcat;

    time = viewer.clock.currentTime; /// the current computer time in TAI? not in UTC?
    var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
    
    var time_utc = Cesium.JulianDate.now();
    Cesium.JulianDate.addSeconds(time, tai_utc, time_utc);

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
      if (Cesium.defined(icrfToFixed)) 
      {
        
        var positionAndVelocity = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
        
        var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x*1000,positionAndVelocity.position.y*1000,positionAndVelocity.position.z*1000);
        
        position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);
        
        Cesium.Cartesian3.clone(position_ecef,pos_radar_view);

        point.position = position_ecef; //// update back
        
        ///update the radar_view
        debri_collection_radar._pointPrimitives[i].position = pos_radar_view;

      }
  }
}



 var cataloglist =
{
  cat_1 : "fspcat_test",  /// the catalogue file for test
  cat_2 : "fspcat_20190522_v04_nodeb", //// baseline_fspcat_20190522_v04_nodeb.json
	cat_3 : "fspcat_20280101_v04_nodeb", /// fspcat_20280101_v04_nodeb.json
	cat_4 : "fspcat_20230101", /// fspcat_20230101.json
  cat_5 : "fspcat_20230701", /// fspcat_20230701.json
  cat_6 : "fspcat_20230101_v16_nodeb", 
  cat_7 : "fspcat_20280101_v230819_nodeb", 
  cat_8 : "fspcat_20430701_v16_nodeb", 
  cat_9 : "fspcat_20430701_sk_nodeb", 
  cat_10 : "fspcat_20430701_v270819_nodeb", 
  cat_11 : "fspcat_baseline_20190522_v280819_nodeb", 
  cat_12 : "fspcat_20230101_v280819_nodeb", 
  cat_13 : "fspcat_20280101_v280819_nodeb", 
  cat_14 : "fspcat_20430701_v280819_nodeb", 
  tle_1 : "tle_test",
	tle_2 : "tle_geo"  /// geo_tle.json	
}

function GUIset()
{
    var gui = new dat.GUI( { width: 300} );
    gui.domElement.id = 'gui';

    var folderSpacecraft = gui.addFolder( 'Catalogue option' );
    var aaa={catalogName: ""}; ///cataloglist.cat_1
	folderSpacecraft.add( aaa, 'catalogName', Object.values(cataloglist) ).onChange(
		function( value )
		{
      alert(value);
      ///first clear all the catalog data
      satcat.clear_catalogue();
      data_load = false;
      debris_collection.removeAll();
      debri_collection_radar.removeAll();

    var satcat_logfile="http://satellite-api.herokuapp.com/2019";    
    var type="tle";
    //   if(value.substring(0,6) == "fspcat")
    //   {
    //     type="kep";
    //     satcat_logfile = data_path + "catalogue/" + value  + ".json";
    //   }
    //   else if(value.substring(0,3) == "tle")
    //   {
    //     type="tle";
    //     satcat_logfile = data_path + "tle/" + value  + ".json";
    //   }

      satcat.loadcatlog(type,satcat_logfile);
      ///load the corresponding catalog files
      console.log("successfully loaded data");
		}
  );
    
  
  
}


//window.onload = function()

function main(viewer) {

  var satcat = new Catalogue();

  GUIset();

  clockViewModel = new Cesium.ClockViewModel();

   
    // //Enable depth testing so things behind the terrain disappear.
    // viewer.scene.globe.depthTestAgainstTerrain = true;

		
		// viewer.globe = true;
		// viewer.scene.globe.enableLighting = true;
    // viewer.clock.multiplier =  100 ;               // speed of the simulation
    
    // var mycredit= new Cesium.Credit("Space Geodesy and Navigation Laboratory",'data/sgnl.png','https://www.ucl.ac.uk');
    // // var mycredit = new Cesium.Credit('Cesium', 'data/sgnl.png', 'https://www.ucl.ac.uk');
    // viewer.scene.frameState.creditDisplay.addDefaultCredit(mycredit);
    // viewer.CreditDisplay = true;
    // viewer.scene.debugShowFramesPerSecond = true;
    // viewer.scene.frameState.creditDisplay.removeDefaultCredit();

    // start_jd = Cesium.JulianDate.now();
    // //start_jd = Cesium.JulianDate.fromIso8601("2019-01-01T13:00:00Z");
    // viewer.clock.startTime = Cesium.JulianDate.now(); ///It is in system loal time
    // viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    // viewer.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));

    

  
    // var satcat_log = "data/catalogue/fspcat_20230101.json";
    // var tle_log = "data/tle/geo_tle.json";

    // satcat.loadcatlog("kep",satcat_log);
    // satcat.loadcatlog("tle",tle_log);
    
    /// debris_collection to store all the debris points
    debris_collection = new Cesium.PointPrimitiveCollection();
    debri_collection_radar = new Cesium.PointPrimitiveCollection();
    //By seting the blendOption to OPAQUE can improve the performance twice
    debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;

    /// add debris_collection to the viewer
    /// should organize debris in different orbtis to different collections
    debris_collection = viewer.scene.primitives.add(debris_collection);
    debris_collection.blendOption=Cesium.BlendOption.OPAQUE;

    var colour = Cesium.Color.YELLOW;
    
    /// a timer is used to deal with the async reading of JSON
    var timename=setInterval(function(){
      if(satcat.data_load_complete == true
        && data_load == false)
        {
          //ShowDebris(viewer,mycatlog,4);
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
            id: satcat.getDebriName[debrisID],
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 3,
            color: colour
            // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
              });

              /// for the radar_view
              debri_collection_radar.add({
                id: satcat.getDebriName[debrisID],
                position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
                pixelSize: 4,
                color: Cesium.Color.BLUE
                // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
                  });     

          }

          data_load=true;
          // clearInterval(timename); /// clear itself
        }
    },1000); /// allow sometime to load the Earth 

  
    viewer.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
    viewer.scene.preRender.addEventListener(update_debris_position);
    ///viewer.scene.preRender.raiseEvent(debris_collection, viewer,mycatlog);

    
    
  // radar_viewer = new Cesium.Viewer('radar_viewer',options3D);
  // // /// view in ECEF, no need to update icrf
  // // radar_viewer.scene.postUpdate.addEventListener(icrf_radar); // enable Earth rotation, everything is seen to be in eci
  // radar_viewer.scene.globe.enableLighting = true;
  
  // radar_viewer.scene.primitives.add(debri_collection_radar);
    
  
  // ///// disable the default event handlers
  // radar_viewer.scene.screenSpaceCameraController.enableRotate = false;
  // radar_viewer.scene.screenSpaceCameraController.enableTranslate = false;
  // radar_viewer.scene.screenSpaceCameraController.enableZoom = false;
  // radar_viewer.scene.screenSpaceCameraController.enableTilt = false;
  // radar_viewer.scene.screenSpaceCameraController.enableLook = false;
  
  // radar_viewer.scene.frameState.creditDisplay.removeDefaultCredit();

  // var radar_position_ecef =  new Cesium.Cartesian3(0,0,0);
  // var longitude = 81;
  // var latitude  = 61;
  // var height = 10.0;
  // radar_position_ecef = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

  // // // /// show the position of the telescope
  // var redpoint = viewer.entities.add({
  //   name : 'Red point telescope',
  //   position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
  //   point: {pixelSize : 12,color :  Cesium.Color.RED}
  //   });
  
  // radar_screen(radar_position_ecef);


}
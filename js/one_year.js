var viewer_main, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection
var handler;


function numberOfLoads() {
  // this function is for when the main toolbar button is clicked
  // first ensure that all elements are behind the main cesium container
  document.getElementById('button1year').style.zIndex = 9999;
  document.getElementById('hotspot_toolbar').style.zIndex = -9990;
  document.getElementById('button2year').style.zindex = -100;
  document.getElementById('hotspot_legend').style.zIndex = -9999;  
  document.getElementById('satellite_legend').style.zIndex = 9999;  

  // try {viewer_main.dataSources.removeAll()} catch(err) {console.log(err)};


  one_year_clicked = true;

  // remove the double screen
  if (two_year_clicked == true) {
    viewer2.destroy();
    document.getElementById('button2year').style.zIndex = -100;
    two_year_clicked = false;
  }

  //remove the hotspot data if exists
  try {viewer_main.dataSources.removeAll()} catch (err) {console.log(err);}

  
  count = count + 1; 
  console.log(count);

  // remove and restart the data every time the 1 year button is clicked
    if (!satcat === true) {
      oneYearLoad();
      console.log('im on the wrong side');

    } else {
      satcat.clear_catalog();
      data_load = false;
      debris_collection.removeAll();
      debri_collection_radar.removeAll();
      console.log('im in the if statement');
      oneYearLoad();
    }
  }


function oneYearLoad() {
    // this is only for the search button when clicked
    satcat = new Catalogue();
    // get the user's year from the search box
    var userOneYear = document.getElementById('1yearsearch').value;
    var satcat_logfile = getURL(userOneYear);
    
    type="kep";
    //satcat_logfile="http://satellite-api.herokuapp.com/"+userOneYear+"";
    
    satcat.loadCatalog(type, "./data/2023.json");
    
    clockViewModel = new Cesium.ClockViewModel();
     //Enable depth testing so things behind the terrain disappear.
    viewer_main.scene.globe.depthTestAgainstTerrain = true;       
    viewer_main.globe = true;
    viewer_main.scene.globe.enableLighting = true;
    viewer_main.clock.multiplier =  100 ;               // speed of the simulation
    handler = new Cesium.ScreenSpaceEventHandler(viewer_main.scene.canvas);

     
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
     sphere_collection = new Cesium.EntityCollection();

     //By seting the blendOption to OPAQUE can improve the performance twice 
     /// add debris_collection to the viewer_main
     /// should organize debris in different orbtis to different collections
     debris_collection = viewer_main.scene.primitives.add(debris_collection);
     debris_collection.blendOption=Cesium.BlendOption.OPAQUE;
     
     var colour; 

     /// a timer is used to deal with the async reading of JSON
     var timename=setInterval( function() 
     {
       if(satcat.data_load_complete == true && data_load == false)
      {
        //ShowDebris(viewer_main,mycatlog,4);
        console.log(satcat.getNumberTotal());
        
       for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) 
       //for (var debrisID = 0; debrisID < 1; debrisID++) 
        {
          var operation_status = satcat.getDebrisOperationStatus(debrisID);
          var name = satcat.getSatelliteName(debrisID);
          if (operation_status > 0.0) 
          {
            colour = Cesium.Color.YELLOW;
          }
          else
          {
            colour = Cesium.Color.RED;
          }

          if (name.includes('Starlink')) {
            colour = Cesium.Color(1.0, 1.0, 1.0, 0.5);
            debris_collection.add({
              id: [debrisID],
              position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
              pixelSize: 10,
              alpha: 0.5,
              color: colour,
            });
    
          }
        }

        data_load=true;
      }  
     }, 1000); /// allow sometime to load the Earth 
 
     viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
     viewer_main.scene.postUpdate.addEventListener(update_debris_position);


    // will return the selected satellite name when the object is clicked
    handler.setInputAction(function(movement) {
      const pickedFeature = viewer_main.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
          // nothing picked
          return;
      }
      else {
        document.getElementById("satelliteInfoBox").value = satcat.returnSatelliteInformationAsString(pickedFeature.id)
        console.log(pickedFeature.id)
        console.log(satcat.returnSatelliteInformationAsString(pickedFeature.id));

        // the plot the orbit of the selected satellite
        var orbit_positions = satcat.getOrbitForSatellite(pickedFeature.id);
        
        console.log(orbit_positions);
        viewer_main.entities.add({
          name: 'orbit',
          polyline: {
            positions: Cesium.Cartesian3.fromRadiansArrayHeights(orbit_positions), 
            width: 10,
            material : new Cesium.PolylineOutlineMaterialProperty({
              color : Cesium.Color.DEEPSKYBLUE,
              outlineWidth : 4,
              outlineColor : Cesium.Color.DARKBLUE
          })
          }
        })
        
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
}


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

    var pos_radar_view = new Cesium.Cartesian3();

    for (var i = 0; i < points.length; ++i) 
    {
      var point = points[i];
      //Cesium.Cartesian3.clone(point.position, position_ecef);

      ///compute the position of debris according to time
      if (Cesium.defined(icrfToFixed)) // date transformation
      {
        var positionAndVelocity = mycatlog.computeDebrisPositionECI(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
        
        var position_eci = new Cesium.Cartesian3( 
          positionAndVelocity.position.x*1000,
          positionAndVelocity.position.y*1000,
          positionAndVelocity.position.z*1000
        );
        
        position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);
        
        Cesium.Cartesian3.clone(position_ecef, pos_radar_view);
        
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


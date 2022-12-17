function numberOfLoads() {
  // this function is for when the main toolbar button is clicked
  // first ensure that all elements are behind the main cesium container
  document.getElementById('button1year').style.zIndex = 9999;
  document.getElementById('hotspot_toolbar').style.zIndex = -9990;
  document.getElementById('button2year').style.zindex = -100;
  document.getElementById('hotspot_legend').style.zIndex = -9999;  
  document.getElementById('satelliteLegend').style.zIndex = 9999;  
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

  } else {
    satcat.clear_catalog();
    data_load = false;
    console.log(debris_collection)
    if (typeof debris_collection == undefined) {
      debris_collection.removeAll();
    }
    oneYearLoad();
  }
}

function oneYearLoad() {

    var satcat = new Catalogue();
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

    // Clock Settings
    start_jd = Cesium.JulianDate.now();
    viewer_main.clock.startTime = Cesium.JulianDate.now();
    viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));

    /// Collections to store Points/Entities
    debris_collection = new Cesium.PointPrimitiveCollection();
    sphere_collection = new Cesium.EntityCollection();

    // By seting the blendOption to OPAQUE can improve the performance twice 
    /// should organize debris in different orbtis to different collections
    debris_collection = viewer_main.scene.primitives.add(debris_collection);
    debris_collection.blendOption=Cesium.BlendOption.OPAQUE;
    
    var colour; 

    /// a timer is used to deal with the async reading of JSON
    var timename=setInterval( function() 
    {
      if(satcat.data_load_complete == true && data_load == false)
    {
      console.log(satcat.getNumberTotal());
      
      for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) 
      {
        var operation_status = satcat.getDebrisOperationStatus(debrisID);
        var name = satcat.getSatelliteName(debrisID);
        if (operation_status > 0.0) 
        {
          colour = Cesium.Color.YELLOW;

          debris_collection.add({
            id: [debrisID],
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 1,
            alpha: 0.5,
            color: colour
          });
        }
        else
        {
          colour = Cesium.Color.RED;
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
      } else {
        // Add information to text box - soon will be a table
        document.getElementById("satelliteInfoBox").value = satcat.returnSatelliteInformationAsString(pickedFeature.id)

        // the plot the orbit of the selected satellite
        var orbit_positions = satcat.getOrbitForSatellite(pickedFeature.id);
        
        // console.log(orbit_positions);
        // viewer_main.entities.add({
        //   name: 'orbit',
        //   polyline: {
        //     positions: Cesium.Cartesian3.fromRadiansArrayHeights(orbit_positions), 
        //     width: 10,
        //     material : new Cesium.PolylineOutlineMaterialProperty({
        //       color : Cesium.Color.DEEPSKYBLUE,
        //       outlineWidth : 4,
        //       outlineColor : Cesium.Color.DARKBLUE
        //   })
        //   }
        // })
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


var twoYearcount = 0;

function twoYear () {

    // this will stop more cesium containers opening every time 'Compare 2 Years' is clicked
    two_year_clicked = true;
    twoYearcount = twoYearcount + 1;


    // bring the search bar to the front
    document.getElementById('button2year').style.zIndex = 9999;
    
    
    if (twoYearcount < 2) {
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


}

function addSecondYearSatelliteData() {

    
    satcat = new Catalogue();

    // get the user's year from the search box
    var userOneYear = document.getElementById('button2yearval').value;

    type="test";
    satcat_logfile="http://satellite-api.herokuapp.com/"+userOneYear+"";

    satcat.loadcatlog(type,satcat_logfile);
    
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
 
     start_jd = Cesium.JulianDate.now();
     //start_jd = Cesium.JulianDate.fromIso8601("2019-01-01T13:00:00Z");
     viewer2.clock.startTime = Cesium.JulianDate.now(); ///It is in system loal time
     viewer2.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
     viewer2.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
 
          
     /// debris_collection2 to store all the debris points
     debris_collection2 = new Cesium.PointPrimitiveCollection();
     debri_collection_radar = new Cesium.PointPrimitiveCollection();
     //By seting the blendOption to OPAQUE can improve the performance twice
     debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;
 
     /// add debris_collection2 to the viewer2
     /// should organize debris in different orbtis to different collections
     debris_collection2 = viewer2.scene.primitives.add(debris_collection2);
     debris_collection2.blendOption=Cesium.BlendOption.OPAQUE;
 
     var colour = Cesium.Color.YELLOW;
     
     /// a timer is used to deal with the async reading of JSON
     var timename=setInterval(function(){
       if(satcat.data_load_complete == true
         && data_load == false)
         {
           //ShowDebris(viewer2,mycatlog,4);
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
 
             debris_collection2.add({
             id: satcat.getDebriName([debrisID]),
             position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
             pixelSize: 3,
             color: colour
             });  
 
           }
 
           data_load=true;
           // clearInterval(timename); /// clear itself
           }
    
          //  viewer2.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
          //  viewer2.scene.preRender.addEventListener(update_debris_position);
          //  viewer2.scene.postUpdate.addEventListener(update_debris_position);
    
     },1000); /// allow sometime to load the Earth 
 
     viewer2.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
     //viewer2.scene.preRender.addEventListener(update_debris_position);
     viewer2.scene.postUpdate.addEventListener(update_debris_position);


}
// load the current view of space
async function LoadLiveSatelliteData() {
    // look at the current map and then remove any existing satellites
    satcat = new Catalogue();
    CesiumInitialConditions();
    var satelliteJSON;

    var apiHandler = new ApiHandler("./data/2023.json");
    satelliteJSON = apiHandler.LoadJSONSatelliteData();
    if (satcat.LoadCatalogue(satelliteJSON)) {
        satcat.PropogateCatalogue();
    } else {
        alert("Unable to load catalogue into the visualiser. Please try again.");
    }
}

function CesiumInitialConditions() {
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
}
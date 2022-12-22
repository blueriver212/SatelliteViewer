var viewer_main, radar_viewer;
var start_jd;
var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var handler;
var satcat = new Catalogue();
var orbits = new Cesium.EntityCollection();
var objectCatalogue = new Cesium.PointPrimitiveCollection();
var handler;
var dataFormat;


// load the current view of space
async function LoadLiveSatelliteData() {
    // look at the current map and then remove any existing satellites
    CesiumInitialConditions();
    dataFormat = "kep";
    var apiHandler = new ApiHandler("./data/2023.json", dataFormat);   
    var satellites = apiHandler.LoadJSONSatelliteData();
    
    if (satcat.LoadCatalogue(satellites, dataFormat)) {
        PropogateCatalogue(dataFormat);
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
    // viewer_main.entities.add(orbits);
    handler = new Cesium.ScreenSpaceEventHandler(viewer_main.scene.canvas);
}

function PropogateCatalogue() {
        // By seting the blendOption to OPAQUE can improve the performance twice 
		/// should organize debris in different orbtis to different collections
		objectCatalogue = viewer_main.scene.primitives.add(objectCatalogue);
		objectCatalogue.blendOption=Cesium.BlendOption.OPAQUE;
        
        if (dataFormat === "kep") {
            satcat.ReturnCatalogue(dataFormat).forEach(element => {
                var operationStatus = satcat.GetObjectOperationStatusFromPayloadOperationalStatus(element["payload_operational_status"].trim());
                if (operationStatus > 0.0) {
                    colour = Cesium.Color.YELLOW;
                } 
                else {
                    colour = Cesium.Color.RED;
                } 
    
                objectCatalogue.add({
                    id: element["object_id"],
                    position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
                    pixelSize: 1,
                    alpha: 0.5,
                    color: colour
                });
            });
        } else {
            var dataTLE = satcat.ReturnCatalogue(dataFormat);

            for (var i = 0; i < dataTLE.length; i ++) {
                objectCatalogue.add({
                    id: i,
                    position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
                    pixelSize: 10,
                    alpha: 0.5,
                    color: colour
                });
            }   
        }

		viewer_main.scene.postUpdate.addEventListener(this.ICRFViewMain); // enable Earth rotation, everything is seen to be in eci
    	viewer_main.scene.postUpdate.addEventListener(this.UpdateObjectPosition);
        handler.setInputAction(LeftClickOnSatellite, Cesium.ScreenSpaceEventType.LEFT_DOWN);
}

function UpdateObjectPosition()
{	

    time = viewer_main.clock.currentTime; /// the current computer time in TAI? not in UTC?
    var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
    var time_utc = Cesium.JulianDate.now();
    Cesium.JulianDate.addSeconds(time, tai_utc, time_utc); // often modified julian date, as it is a smaller number 6 digits before dp

    var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
    var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()
    var position_ecef = new Cesium.Cartesian3();
    var points = objectCatalogue._pointPrimitives;

    var pos_radar_view = new Cesium.Cartesian3();
    points.forEach(element => {
            if (Cesium.defined(icrfToFixed)) // date transformation
            {
                if (dataFormat === "kep") {
                    var positionAndVelocity = satcat.ComputeObjectPositionECI(element._id, time_date_js, dataFormat);
                    var position_eci = new Cesium.Cartesian3( 
                        positionAndVelocity.pos.x*1000,
                        positionAndVelocity.pos.y*1000,
                        positionAndVelocity.pos.z*1000
                    );
                 
                    position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);    
                    Cesium.Cartesian3.clone(position_ecef, pos_radar_view);     
    
                    element.position = position_ecef; //// update back     
                } else if (dataFormat === "TLE") {
                    var positionAndVelocity = satcat.ComputeObjectPositionECI(element._id, time_date_js, dataFormat);
                    var position_eci = new Cesium.Cartesian3( 
                        positionAndVelocity.position.x/1000000,
                        positionAndVelocity.position.y/1000000,
                        positionAndVelocity.position.z/1000000
                    );
                    
                    position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);    
                    Cesium.Cartesian3.clone(position_ecef, pos_radar_view);     
    
                    element.position = position_ecef; //// update back     
                }
            }
    });
}
    
function ICRFViewMain(scene, time) 
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

function LeftClickOnSatellite(movement)
{
    const pickedFeature = viewer_main.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
        return;
    } else {
        // Add information to text box - soon will be a table
        //document.getElementById("satelliteInfoBox").value = satcat.ReturnObjectInformationAsJSONForTable(pickedFeature.id)
        document.getElementById("objectTable").style.display = "block";

        var data = satcat.ReturnObjectInformationAsJSONForTable(pickedFeature.id);
        $(function () {
            $('#objectTableBootstrap').bootstrapTable("load", data.item);
            $('#objectTableBootstrap').bootstrapTable("updateFormatText", 'test');
        });




        // the plot the orbit of the selected satellite
        // var orbit_positions = satcat.GetOrbitForObject(pickedFeature.id);
        // console.log(orbit_positions)
        // viewer_main.entities.removeAll();
        // viewer_main.entities.add({
        //     name: 'orbit',
        //     polyline: {
        //     positions: Cesium.Cartesian3.fromDegrees(orbit_positions), 
        //     width: 10,
        //     material : new Cesium.PolylineOutlineMaterialProperty({
        //         color : Cesium.Color.DEEPSKYBLUE,
        //         outlineWidth : 4,
        //         outlineColor : Cesium.Color.DARKBLUE
        //         })
        //     }
        // })
    }
}
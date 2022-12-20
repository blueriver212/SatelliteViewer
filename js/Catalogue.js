//the class to manage the Catalogue data
class Catalogue
{
	constructor()
	{
		this.objectsKeplerian=[]; /// debris described in keplerian elements
		this.objectsTLE=[]; /// debris described in two line elements
		this.data_load_complete=false;
	}

	static clear_catalog(type)
	{
		if(type=="kpe")
		{
			this.objectsKeplerian=[];
		}
		else if(type=="tle")
		{
			this.objectsTLE=[];
		}
		else
		{
			this.objectsKeplerian=[];
			this.objectsTLE=[];
		}

		this.data_load_complete=false;
	}

	stringToDate(_date_str,_format,_delimiter)
	{
		var time = _date_str.split(_delimiter);
		var formatedDate = new Date(time[0],(time[0]-1),time[2]);
		return formatedDate;
	}

	getNumberTotal()
	{
		return this.objectsKeplerian.length + this.objectsTLE.length;
	}

	getDebriInfo(isat)
	{
		if(isat < this.objectsKeplerian.length)
		{
			return this.objectsKeplerian[isat];
		}
		else if(isat >= this.objectsKeplerian.length 
			&& isat < this.getNumberTotal() )
		{
			return this.objectsTLE[isat-this.objectsKeplerian.length]
		}
	}

	getDebriName(isat)
	{
		if(isat < this.objectsKeplerian.length)
		{
			return this.objectsKeplerian[isat]["RSO_name"];
		}
		else if(isat >= this.objectsKeplerian.length 
			&& isat < this.getNumberTotal() )
		{
			return this.objectsTLE[isat-this.objectsKeplerian.length]["name"];
		}
	}

	GetCatalogue() {
		return this.objectsKeplerian;
	}
	
	//ref: http://www.celestrak.com/satcat/status.php
	getDebrisOperationStatus(isat)
	{
		var s = -1;
		if(isat < this.objectsKeplerian.length)
		{
			var aa = this.objectsKeplerian[isat]["payload_operational_status"].trim(); // fsp adds white space to the payload status
			if(aa == '+') {s = 1;} /// operational 
			else if(aa == '-') 	{s = -1;} /// non-operational
			else if(aa == 'P') 	{s = 0.5;} /// partially operational 
			else if(aa == 'B') 	{s = 0.2;} /// backup/standby
			else if(aa == 'S') 	{s = 0.8;} /// spare
			else if(aa == 'X') 	{s = 0.3;} /// extended mission
			else if(aa == 'D') 	{s = -0.2;} /// Decayed
			else if(aa == '?')  {s = 0;} /// unknown	
			else  /// not set
			{
				s = -1;
			}
		}
		else if(isat >= this.objectsKeplerian.length 
			&& isat < this.getNumberTotal() )
		{
			s = 0;
		}
		return s;
	}

	getSatelliteName(isat) 
	{
		return this.objectsKeplerian[isat]["RSO_name"].trim();
	}

	returnSatelliteInformationAsString(isat) 
	{
		var satellite_info = `Name: ${this.objectsKeplerian[isat]["RSO_name"].trim()}, 
		Owner: ${this.objectsKeplerian[isat]["owner"].trim()}`;
		return satellite_info;
	}

	/* 
	Takes an input JSON file and an orbit type (currently defaults to Keplerian Elements) and will load them back to an array
	Will return a boolean depending if the data has been successfully loaded into the software.
	*/
	LoadCatalogue(jsonFile, orbitType = "kep")
	{
		// first remove any satellites that already exist in the catalogue
		this.objectsKeplerian = [];
		
		if (orbitType == "tle")
		{
			that.objectsTLE = data.debris;
			that.data_load_complete = true;

			return true;
		}
		else if(orbitType == "kep")
		{
			this.objectsKeplerian = jsonFile;
			
			// create an index that can then be looped back over when propogating
			// The data has already been loaded into objects Keplerian, this will parse the integers and add index
			for(var objectID = 0; objectID < this.objectsKeplerian.length; objectID++)
			{
				// Dates
				var epochOfOrbit = this.objectsKeplerian[objectID]["epoch_of_orbit"];			
				var timeString = epochOfOrbit.split("-");
				var month = parseInt(timeString[1])-1;

				// Add index and parse string to numbers for kep elements
				this.objectsKeplerian[objectID]["object_id"] = objectID; 
				this.objectsKeplerian[objectID]["true_anomaly"] = parseFloat(this.objectsKeplerian[objectID]["true_anomaly"]);
				this.objectsKeplerian[objectID]['semi_major_axis'] = parseFloat(this.objectsKeplerian[objectID]['semi_major_axis']);
				this.objectsKeplerian[objectID]["eccentricity"] = parseFloat(this.objectsKeplerian[objectID]["eccentricity"]);
				this.objectsKeplerian[objectID]["inclination"] = parseFloat(this.objectsKeplerian[objectID]["inclination"]);
				this.objectsKeplerian[objectID]["epoch_of_orbit"] = new Date(this.objectsKeplerian[objectID]["epoch_of_orbit"]);				
				this.objectsKeplerian[objectID]["RAAN"] = parseFloat(this.objectsKeplerian[objectID]["RAAN"]);
				this.objectsKeplerian[objectID]["argument_of_perigee"] = parseFloat(this.objectsKeplerian[objectID]["argument_of_perigee"]);
			}
			return true;
		}
		return false;
	}
	
	/* 
		Will take each of the objects in the keplerian list. And propogate them with time. 
	*/
	PropogateCatalogue() {
		// By seting the blendOption to OPAQUE can improve the performance twice 
		/// should organize debris in different orbtis to different collections
		var debris_collection = new Cesium.PointPrimitiveCollection();
		debris_collection = viewer_main.scene.primitives.add(debris_collection);
		debris_collection.blendOption=Cesium.BlendOption.OPAQUE;

		for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) 
		{
			var operation_status = satcat.getDebrisOperationStatus(debrisID);
			var name = satcat.getSatelliteName(debrisID);
			if (operation_status > 0.0) {
				colour = Cesium.Color.YELLOW;

				debris_collection.add({
					id: [debrisID],
					position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
					pixelSize: 1,
					alpha: 0.5,
					color: colour
				});
			} else {
				colour = Cesium.Color.RED;
			}    
		}

		viewer_main.scene.postUpdate.addEventListener(this.ICRFViewMain); // enable Earth rotation, everything is seen to be in eci
    	viewer_main.scene.postUpdate.addEventListener(this.UpdateObjectPosition(debris_collection));
	}


	/// compute the positon of debris in eci
	/// time is in  JavaScript Date in UTC
	computeDebrisPositionECI(isat, time)
	{
		if(isat < this.objectsKeplerian.length) /// using keplerian propagation
		{
			var idebri = this.objectsKeplerian[isat];
			var positionAndVelocity={position:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0}};
			//return this.objectsKeplerian[isat];
			var kep = new KeplerianElement();

			kep.setElements(idebri['semi_major_axis'],
							idebri["eccentricity"],
							idebri["inclination"],
							idebri["RAAN"],
							idebri["argument_of_perigee"],
							idebri["true_anomaly"]
							);
			
			var tt0 = new Date(idebri["epoch_of_orbit"]);
	
			var time_diff = (time - tt0)/1000.0; /// in sec
			
			kep.updateElements(time_diff);
			var pv = kep.getStateVector();
			positionAndVelocity.position.x = pv[0];
			positionAndVelocity.position.y = pv[1];
			positionAndVelocity.position.z = pv[2];

			positionAndVelocity.velocity.x = pv[3];
			positionAndVelocity.velocity.y = pv[4];
			positionAndVelocity.velocity.z = pv[5];
			
			return positionAndVelocity;
		}

		else if(isat >= this.objectsKeplerian.length && isat < this.getNumberTotal()) // using spg4 propogation
		{
			var idebri = this.objectsTLE[isat-this.objectsKeplerian.length];
			var line1,line2;
			line1 = idebri["line1"];
			line2 = idebri["line2"];
			
			var satrec = satellite.twoline2satrec(line1, line2);
			var positionAndVelocity = satellite.propagate(satrec,time); /// in km
			return positionAndVelocity;
			//return this.objectsTLE[isat-this.objectsKeplerian.length]
		}
		else
		{
			alert("unknown debri index!!!");
		}
	}

	getOrbitForSatellite(isat)
	{
		// Get the satellite
		var idebri = this.objectsKeplerian[isat];
		var car = new Cesium.Cartographic(), Y = new Cesium.Cartesian3();
		var CRFtoTRF = Cesium.Transforms.computeIcrfToFixedMatrix(Cesium.JulianDate.now()); // Julian Date
		var stateVector, arr = [];
		// add mean anomaly
		idebri.mean_anomaly = null;

		var sattemp = jQuery.extend({}, idebri);

		// calculate the x,y,z of the satellite for a full circle of orbit
		for (sattemp.mean_anomaly = 0.01; sattemp.mean_anomaly < 6.29; sattemp.mean_anomaly += 0.01)
		{
			stateVector = calculateStateVector(sattemp, false)
            Cesium.Matrix3.multiplyByVector(CRFtoTRF, stateVector.pos, Y)

			viewer_main.scene.mapProjection.ellipsoid.cartesianToCartographic(Y, car)
			arr.push(car.longitude, car.latitude, car.height*-1);		
		}
		console.log(sattemp);
		return arr;
	}

	UpdateObjectPosition(scene, time)
	{	

		// viewer_main.clock.startTime = Cesium.JulianDate.now();
		// viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
		// viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
		// var mycatlog = satcat;

		time = viewer_main.clock.currentTime; /// the current computer time in TAI? not in UTC?
		var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
		
		var time_utc = Cesium.JulianDate.now();
		Cesium.JulianDate.addSeconds(time, tai_utc, time_utc); // often modified julian date, as it is a smaller number 6 digits before dp

		var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
		var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()
		var position_ecef = new Cesium.Cartesian3();


		console.log(icrfToFixed)

		var points = debris_set._pointPrimitives;

		var pos_radar_view = new Cesium.Cartesian3();


		for (var i = 0; i < points.length; ++i) 
		{
			var point = points[i];

			///compute the position of debris according to time
			 if (Cesium.defined(icrfToFixed)) // date transformation
			 {
				var positionAndVelocity = this.computeDebrisPositionECI(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
				
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

	ICRFViewMain(scene, time) 
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
 
}


function calculateStateVector(ele, posonly=false)
{
	var EGM96_mu = 3.986004415E14;
	var twoPi = (2*Math.PI)
	if (ele.eccentricAnomaly == 0) {ele.eccentricAnomaly = 0.0001}
	var ecan = eccentricAnomaly(ele.mean_anomaly, ele.eccentricity, 1E-6, 20, twoPi)
    var tran = 2*Math.atan2(Math.sqrt((1+ele.eccentricity)/(1-ele.eccentricity))*Math.sin(ecan/2), Math.cos(ecan/2))
    var p = ele.semi_major_axis*(1 - ele.eccentricity*ele.eccentricity)
    var r = p/(1 + ele.eccentricity*Math.cos(tran))
    var h = Math.sqrt(EGM96_mu*p), ci = Math.cos(ele.inclination), si = Math.sin(ele.inclination), cr = Math.cos(ele.RAAN),
	sr = Math.sin(ele.RAAN), cw = Math.cos(ele.argument_of_perigee + tran), sw = Math.sin(ele.argument_of_perigee + tran)

    var pos = new Cesium.Cartesian3(cr*cw-sr*sw*ci, sr*cw+cr*sw*ci, si*sw), pos2 = new Cesium.Cartesian3()
    Cesium.Cartesian3.multiplyByScalar(pos, r, pos2)
    if (posonly)
	return(pos2)

    var vel = new Cesium.Cartesian3(), vel1 = new Cesium.Cartesian3(), vel2 = new Cesium.Cartesian3()
    Cesium.Cartesian3.subtract(Cesium.Cartesian3.multiplyByScalar(pos2, h*ele.eccentricity*Math.sin(tran)/(r*p), vel1),
			       Cesium.Cartesian3.multiplyByScalar(new Cesium.Cartesian3(cr*sw+sr*cw*ci, sr*sw-cr*cw*ci,-si*cw),h/r,vel2),vel)
    return({pos: pos2, vel: vel})
}

function eccentricAnomaly(mean, ecc, tol, maxIter, twoPi)
{
    var i, curr, prev = mean
    for (i = 1; i <= maxIter; i++)
    {
        curr = prev - (prev - ecc*Math.sin(prev) - mean)/(1 - ecc*Math.cos(prev))
        if (Math.abs(curr - prev) <= tol)
            return(curr % twoPi)
        prev = curr
    }
    return(NaN)
}


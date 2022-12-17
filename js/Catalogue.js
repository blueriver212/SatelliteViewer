//the class to manage the Catalogue data
class Catalogue
{
	constructor()
	{
		this.debris_kep=[]; /// debris described in keplerian elements
		this.debris_tle=[]; /// debris described in two line elements
		this.data_load_complete=false;
	}

	clear_catalog(type)
	{
		if(type=="kpe")
		{
			this.debris_kep=[];
		}
		else if(type=="tle")
		{
			this.debris_tle=[];
		}
		else
		{
			this.debris_kep=[];
			this.debris_tle=[];
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
		return this.debris_kep.length + this.debris_tle.length;
	}

	getDebriInfo(isat)
	{
		if(isat < this.debris_kep.length)
		{
			return this.debris_kep[isat];
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			return this.debris_tle[isat-this.debris_kep.length]
		}
	}

	getDebriName(isat)
	{
		if(isat < this.debris_kep.length)
		{
			return this.debris_kep[isat]["RSO_name"];
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			return this.debris_tle[isat-this.debris_kep.length]["name"];
		}
	}

	getCatalogue() {
		return this.debris_kep;
	}
	
	//ref: http://www.celestrak.com/satcat/status.php
	getDebrisOperationStatus(isat)
	{
		var s = -1;
		if(isat < this.debris_kep.length)
		{
			var aa = this.debris_kep[isat]["payload_operational_status"].trim(); // fsp adds white space to the payload status
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
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			s = 0;
		}
		return s;
	}

	getSatelliteName(isat) 
	{
		return this.debris_kep[isat]["RSO_name"].trim();
	}

	returnSatelliteInformationAsString(isat) 
	{
		var satellite_info = `Name: ${this.debris_kep[isat]["RSO_name"].trim()}, 
		Owner: ${this.debris_kep[isat]["owner"].trim()}`;
		return satellite_info;
	}

	/// read in the debris data in the format of JSON
	loadCatalog(orbit_type,jsonFile)
	{
		// first need to turn remove the search button and then turn it into a spinner
		document.getElementById('button1year').style.zIndex = -2000;
		document.getElementById('spinner').style.zIndex = 9999;
		document.getElementById('dropdown').style.zIndex = -9999;

		var that = this;
		/// Here we used sync mode which will cause Cesium an issue in the loading of Earth
		/// possible solution is to integrate Cesium viewer in the Catalogue class 
		$.ajax({
			url: jsonFile,
			type: "GET",
			dataType: "json",
			async: false,
			success: function(data) { /// a callback function to parse the data into the class object
				
				if(orbit_type == "tle")
				{
					that.debris_tle = data.debris;

					that.data_load_complete = true;
				}

				else if(orbit_type == "kep")
				{
					that.debris_kep = data.debris;
					var isat=-1;
					for(isat = 0;isat < that.debris_kep.length; isat++)
					{
						var idebri = that.debris_kep[isat];
						
						var epoch_of_orbit_str = idebri["epoch_of_orbit"];
						
						var t0_str = epoch_of_orbit_str.split("-");
						var month = parseInt(t0_str[1])-1;
						that.debris_kep[isat]["epoch_of_orbit"] = new Date(t0_str[0],month,t0_str[2]);				
						that.debris_kep[isat]['semi_major_axis'] = parseFloat(idebri['semi_major_axis']);
						that.debris_kep[isat]["eccentricity"] = parseFloat(idebri["eccentricity"]);
						that.debris_kep[isat]["inclination"] = parseFloat(idebri["inclination"]);
						that.debris_kep[isat]["RAAN"] = parseFloat(idebri["RAAN"]);
						that.debris_kep[isat]["argument_of_perigee"] = parseFloat(idebri["argument_of_perigee"]);
						that.debris_kep[isat]["true_anomaly"] = parseFloat(idebri["true_anomaly"]);
					}

					that.data_load_complete = true;
				}

				// send the spinner to the back and bring forward the search bar
				document.getElementById('button1year').style.zIndex = 9998;
				document.getElementById('spinner').style.zIndex = -9999;		
				document.getElementById('dropdown').style.zIndex = 9999;		
			} // END OF DATA
 		}) // end of ajax
	}
	
	/// compute the positon of debris in eci
	/// time is in  JavaScript Date in UTC
	computeDebrisPositionECI(isat, time)
	{
		if(isat < this.debris_kep.length) /// using keplerian propagation
		{
			var idebri = this.debris_kep[isat];
			var positionAndVelocity={position:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0}};
			//return this.debris_kep[isat];
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

		else if(isat >= this.debris_kep.length && isat < this.getNumberTotal()) // using spg4 propogation
		{
			var idebri = this.debris_tle[isat-this.debris_kep.length];
			var line1,line2;
			line1 = idebri["line1"];
			line2 = idebri["line2"];
			
			var satrec = satellite.twoline2satrec(line1, line2);
			var positionAndVelocity = satellite.propagate(satrec,time); /// in km
			return positionAndVelocity;
			//return this.debris_tle[isat-this.debris_kep.length]
		}
		else
		{
			alert("unknown debri index!!!");
		}
	}

	getOrbitForSatellite(isat)
	{
		// Get the satellite
		var idebri = this.debris_kep[isat];
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
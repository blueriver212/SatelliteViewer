//the class to manage the Catalogue data
class Catalogue
{
	constructor()
	{
		this.objectsKeplerian=[]; /// debris described in keplerian elements
		this.objectsTLE=[]; /// debris described in two line elements
		this.data_load_complete=false;
	}

	static ClearCatalogue(type)
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

	StringToDate(_date_str,_format,_delimiter)
	{
		var time = _date_str.split(_delimiter);
		var formatedDate = new Date(time[0],(time[0]-1),time[2]);
		return formatedDate;
	}

	GetNumberTotal()
	{
		return this.objectsKeplerian.length + this.objectsTLE.length;
	}

	ReturnCatalogue()
	{
		return this.objectsKeplerian;
	}

	GetObjectInfo(isat)
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

	GetObjectDate(isat){
		return this.objectsKeplerian[isat]["launch_date"];
	}

	GetObjectName(isat)
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
	GetObjectOperationStatus(isat)
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

	GetObjectOperationStatusFromPayloadOperationalStatus(paylodOperationalStatus) 
	{
		var s = -1;
		var aa = paylodOperationalStatus;
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
		
		return s;
	}

	GetObjectName(isat) 
	{
		return this.objectsKeplerian[isat]["RSO_name"].trim();
	}

	ReturnObjectInformationAsString(isat) 
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



	/// compute the positon of debris in eci
	/// time is in  JavaScript Date in UTC
	ComputeObjectPositionECI(isat, time)
	{
		if(isat < this.objectsKeplerian.length) /// using keplerian propagation
		{
			var idebri = this.objectsKeplerian[isat];
			var kep = new KeplerianElement();

			kep.setElements(idebri['semi_major_axis'],
							idebri["eccentricity"],
							idebri["inclination"],
							idebri["RAAN"],
							idebri["argument_of_perigee"],
							idebri["true_anomaly"]
							);
			
			var tt0 = new Date(idebri["epoch_of_orbit"]);
			var time_diff = (time - tt0)/100000; /// in sec
			
			var pv = kep.ReturnStateVectorWithTimeStep(time_diff);
			return pv;
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
		}
		else
		{
			alert("unknown debri index!!!");
		}
	}

	GetOrbitForSatellite(isat)
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
}

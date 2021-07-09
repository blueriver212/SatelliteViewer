// a class to deal with catalogue data, giving a number of functions to deal with its format
class Catalogue {
    constructor(){
        this.debris_kep=[]; // debris described in keplerian elements
        this.debris_tle=[]; // debris described in two line elements
        this.data_load_complete=false; // start by assigning it to false
    }

    clear_catalogue(type) {
        // this will restart all of the lists

        if(type=="kpe") {
            this.debris_kep=[];
        }
        else if (type=="tle") {
            this.debris_tle=[];
        }
        else {
            this.debris_kep = [];
            this.debris_tle = [];
        }
        this.data_load_complete=false;
    }

    // not sure this function is actually used ... 
    stringToDate(_date_str, _format, _delimiter) {
        
    }

    getNumberTotal() {
        // returns the total number of debris objects

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

    getDebriOperation_status(isat)
	{
		var s = -1;
		if(isat < this.debris_kep.length)
		{
			var aa = this.debris_kep[isat]["payload_operational_status"];
			
			if(aa == '+    ') {s = 1;} /// operational 
			else if(aa == '-    ') 	{s = -1;} /// non-operational
			else if(aa == 'P    ') 	{s = 0.5;} /// partially operational 
			else if(aa == 'B    ') 	{s = 0.2;} /// backup/standby
			else if(aa == 'S    ') 	{s = 0.8;} /// spare
			else if(aa == 'X    ') 	{s = 0.3;} /// extended mission
			else if(aa == 'D    ') 	{s = -0.2;} /// Decayed
			else if(aa == '?    ')  {s = 0;} /// unknown	
			else  /// not set
			{
				s = -1;
			}
		}
		else if(isat >= this.debris_kep.length 
			&& isat < this.getNumberTotal() )
		{
			s = 0;
			// return this.debris_tle[isat-this.debris_kep.length]["name"];
			// tle  does not include operational status
		}

		return s;

	}

    loadcatlog(orbit_type, jsonFile) {
        console.log("loading files...");

        var that = this;

        // this is where he uses jquery to actually load the files

        $.ajax({
            url:jsonFile,
            type:"GET",
            dataType:"json",
            success: function (data) {
                // this will parse the returning data into a class object
                console.log('im inside the jquery function');
                console.log(data.slice(0,10));
                if (orbit_type == "tle") {
                    that.debris_tle = data.debris;
                    console.log("I am loading tle data tle using ajax");
                    console.log(that.debris_tle.length);

                    that.data_load_complete = true;
                }

                else if (orbit_type == "kep") {
                    that.debris_kep = data.debris;
                    var isat = -1;
                    for (isat = 0; isat < that.debris_kep.length; isat++) {
                        var idebri = that.debris_kep[isat];

                        var epoch_of_orbit_str = idebri["epoch_of_orbit"];
					
                        var t0_str = epoch_of_orbit_str.split("-");
                        var month = parseInt(t0_str[1])-1;o
                        that.debris_kep[isat]["epoch_of_orbit"] = new Date(t0_str[0],month,t0_str[2]);
                        
                        that.debris_kep[isat]['semi_major_axis'] = parseFloat(idebri['semi_major_axis']);
                        that.debris_kep[isat]["eccentricity"] = parseFloat(idebri["eccentricity"]);
                        that.debris_kep[isat]["inclination"] = parseFloat(idebri["inclination"]);
                        that.debris_kep[isat]["RAAN"] = parseFloat(idebri["RAAN"]);
                        that.debris_kep[isat]["argument_of_perigee"] = parseFloat(idebri["argument_of_perigee"]);
                        that.debris_kep[isat]["true_anomaly"] = parseFloat(idebri["true_anomaly"]);
                    }

                    console.log("I am loading kep data using ajax");
                    console.log(that.debris_kep.length);
                    that.data_load_complete = true;
                }
            }
        })
    }


    // compute the position of debris in eci
    // time is in js date in UTC
    compute_derbi_position_eci(isat, time) {
        if(isat < this.debris_kep.length) /// using keplerian propagation
		{
			var idebri = this.debris_kep[isat];
			var positionAndVelocity={position:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0}};
			//return this.debris_kep[isat];
			var kep = new KeplerianElement();
			kep.setElements(idebri['semi_major_axis'],idebri["eccentricity"],
							idebri["inclination"],idebri["RAAN"],
							idebri["argument_of_perigee"],idebri["true_anomaly"]
							);
			
			
			// var epoch_of_orbit_str = idebri["epoch_of_orbit"];
			
			// var t0_str = epoch_of_orbit_str.split("-");
			// var month = parseInt(t0_str[1])-1;
			// var tt0 = new Date(t0_str[0],month,t0_str[2]);
			
			var tt0 = idebri["epoch_of_orbit"];
			
			var time_diff = (time - tt0)/1000.0; /// in sec
			
			// var time_diff = 100;
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
		else if(isat >= this.debris_kep.length /// using SGP4 propagation
			&& isat < this.getNumberTotal() )
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

    

} // end of catalogue
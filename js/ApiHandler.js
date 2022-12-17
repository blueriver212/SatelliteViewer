class ApiHandler
{
    constructor(baseURL) 
    {
        this.baseURL = baseURL;
    }

    
    DataValidater(data) {
        var firstRow = data[0];
        if (firstRow.RSO_name == undefined) {
            alert("Your data does not include a RSO Name. It cannot be loaded into the FSP Visualiser.");
            return false;
        } 

        if (firstRow.eccentricity == undefined || firstRow.inclination == undefined || firstRow.true_anomaly == undefined  || firstRow.RAAN == undefined || firstRow.argument_of_perigee == undefined)
        {
            alert("The data does not have a complete set of keplerian elements. It cannot be visualised into the FSP Visualiser");
            return false
        }

        return true;
    }

    LoadJSONSatelliteData()
    {
        var temp = null;
        $.ajax({
			url: this.baseURL,
			type: "GET",
			dataType: "json",
			async: false,
			success: function(data) { /// a callback function to parse the data into the class object
				temp = data.debris; // for future versions, this should be able to take	multiple data types
			}
 		})

        if(this.DataValidater(temp))
        {
            return temp;
        }
    }
}


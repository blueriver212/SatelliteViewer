class ApiHandler
{
    constructor(baseURL, dataType) 
    {
        this.baseURL = baseURL;
        this.dataType = dataType;
    }

    
    DataValidater(data, dataType) {
        if (dataType === "kep") {
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
        } 

        // will need to validate that it is actual TLE, but this can come later
        
        return true;
    }

    LoadJSONSatelliteData()
    {
        var temp = null;
        if (this.dataType === "kep") {
            $.ajax({
                url: this.baseURL,
                type: "GET",
                dataType: "json",
                async: false,
                success: function(data) { /// a callback function to parse the data into the class object
                    temp = data.debris; 
                }
             })
        } else if (this.dataType === "TLE") {
            $.ajax({
                url: this.baseURL,
                async: false,
                success: function (data){
                    temp = data;                    
                }
            });   
        }

        if(this.DataValidater(temp, this.dataType))
        {
            return temp;
        }
    }
}


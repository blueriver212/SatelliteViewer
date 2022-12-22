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

        if (dataType === "TLE") {
            
        }
        
        return true;
    }

    LoadJSONSatelliteData()
    {
        var objects;
        var temp;

        if (this.dataType === "kep") {
            $.ajax({
                url: this.baseURL,
                type: "GET",
                dataType: "json",
                async: false,
                success: function(data) { /// a callback function to parse the data into the class object
                    objects = data.debris; 
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
            temp = temp.split(/\r?\n|\r|\n/g);
            objects = [];
            for (var i = 0; i < temp.length; i++){
                if (temp[i][0] == "1") {
                    objects.push(temp[i]);
                } else if (temp[i][0] == "2"){
                    var lastItem = objects.pop();
                    objects.push([lastItem, temp[i]])
                }
            }  
        }

        if(this.DataValidater(objects, this.dataType))
        {
            return objects;
        }
    }
}


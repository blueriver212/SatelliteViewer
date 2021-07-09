var satcat = new Catalogue(); // intialise the catalogue class

function oneYearLoad() {
    console.log("I have been clicked");
    removeMapData();
    main();

    // remove the slider from the screen 
    document.getElementById('slider').style.zIndex = "-1";
}

function main() {
    // first load the data 
    // here he has the the different types of loading, we are just going to first return the test data

    //satcat.loadcatlog("kep", "https://satellite-api.herokuapp.com/2019");
    satcat.loadcatlog("kep", "http://satellite-api.herokuapp.com/2022"); // okay this now works
}

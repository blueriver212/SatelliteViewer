var satcat = new Catalogue(); // intialise the catalogue class

var viewer_main, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection

var satcat;
var data_path="data/";


// function oneYearLoad() {
//     console.log("I have been clicked");
//     removeMapData();
//     main();
    
//     // remove the slider from the screen 
//     document.getElementById('slider').style.zIndex = "-1";
// }

var express = require('express');
var path = require("path");
var fs = require('fs');
var app = express();


var http = require('http'); var https = require('https');

var httpServer = http.createServer(app);

//port = 4480;
//httpServer.listen(port);

const port = process.env.PORT || 3000;

httpServer.listen(port, () => console.log(`Listening on ${port}`));

// this is what will appear when you just got to localhost:4443
app.get('/',function (req,res) {
	//res.sendFile(path.join(__dirname+'/home.html'))
	res.sendFile(path.join(__dirname+'/index.html'));
});

// adding functionality to log the requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});

// this is what allows all of the files in the folder to be inlcuded on the server
app.use(express.static(__dirname));
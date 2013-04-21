
/*
 * GET home page.
 */
// var FoursquareStrategy = require('passport-foursquare').Strategy;
var request = require("request");
var FOURSQUARE_CLIENT_ID = "ATEFV1ELBMMHFMU5T1GDFGLVVS150EFF50QKC2ZJOVKT5XKR"
var FOURSQUARE_CLIENT_SECRET = "VMRJQSH0CFTDAI04BG4N3JVSDZFBOQSPAPEVLGEBXUZQD23V";

var config = {
  'secrets' : {
    'clientId' : FOURSQUARE_CLIENT_ID,
    'clientSecret' : FOURSQUARE_CLIENT_SECRET,
    'redirectUrl' : 'http://localhost:5000/callback'
  }
}

var foursquare = require('node-foursquare')(config);



var siteTitle = "Urban Coyotes";

exports.index = function(req, res){

	var templateData = {
		title : siteTitle,
	}
  res.render('index.html', templateData);
};

exports.foursquare_exploreVenues = function (req, res) {
	var searchRadius = 5;
	var foursquareExploreURL = "https://api.foursquare.com/v2/venues/explore?ll=40.7,-74&client_id=ATEFV1ELBMMHFMU5T1GDFGLVVS150EFF50QKC2ZJOVKT5XKR&client_secret=VMRJQSH0CFTDAI04BG4N3JVSDZFBOQSPAPEVLGEBXUZQD23V&v=20130419&v=20130419&radius="+searchRadius;
	
	// make a request to remote_api_url
	request.get(foursquareExploreURL, function(error, response, data) {


		if(error){
			res.send("There was an error requesting the foursquare url.")
		}
		// convert data JSON string to native JS object
        var apiData = JSON.parse(data);
        //console.log(data);
        // if apiData has property 'status == OK' then successful api request
	    if (apiData.meta.code == 200) {
		
		// prepare template data for remote_api_demo.html template
	        var templateData = {
	            title : siteTitle,
	            searchRadius : searchRadius,
	            numResults : apiData.numResults,
	            rawJSON : apiData 
	            //foursquareExploreURL : foursquareExploreURL
	        }
	        
	        res.send("index.html", templateData);
	    }
	});


};

//write route for checkins

exports.foursquareLogin = function(req, res) {
  res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  res.end();
}

exports.foursquareCallback = function (req, res) {
  foursquare.getAccessToken({
	    code: req.query.code
	  }, function (error, accessToken) {
	    if(error) {
	      res.send('An error was thrown: ' + error.message);
	    }
	    else {
	      // Save the accessToken and redirect.
	      res.send(req.query.code + "<br>" + accessToken);

	    }
  });
}





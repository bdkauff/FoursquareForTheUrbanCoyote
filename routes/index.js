
var request = require("request");

// figure out how to refer to process.env file instead of insecurely hardcoding in these codes
var FOURSQUARE_CLIENT_ID = "ATEFV1ELBMMHFMU5T1GDFGLVVS150EFF50QKC2ZJOVKT5XKR"
var FOURSQUARE_CLIENT_SECRET = "VMRJQSH0CFTDAI04BG4N3JVSDZFBOQSPAPEVLGEBXUZQD23V";
var siteTitle = "Urban Coyotes";
//************************************************************************//
//Using node-foursquare just to handle oath/access tokens. See exports at bottom.
var config = {
  'secrets' : {
    'clientId' : FOURSQUARE_CLIENT_ID,
    'clientSecret' : FOURSQUARE_CLIENT_SECRET,
    'redirectUrl' : 'http://localhost:5000/callback'
  }
}
var foursquare = require('node-foursquare')(config);
//************************************************************************//
exports.index = function(req, res){

	var templateData = {
		title : siteTitle,
	}
  res.render('index.html', templateData);
};

exports.foursquare_exploreVenues = function (req, res) {
	var searchRadius = 15;
	var foursquareExploreURL = "https://api.foursquare.com/v2/venues/explore?ll=40.7293522372629,-73.9935731839472&client_id=ATEFV1ELBMMHFMU5T1GDFGLVVS150EFF50QKC2ZJOVKT5XKR&client_secret=VMRJQSH0CFTDAI04BG4N3JVSDZFBOQSPAPEVLGEBXUZQD23V&v=20130419&radius="+searchRadius;
	
	// make a request to remote_api_url
	request.get(foursquareExploreURL, function(error, response, data) {
		
		if(error){
			res.send("There was an error requesting the foursquare url.")
		}
		// convert data JSON string to native JS object
        var apiData = JSON.parse(data);
        	console.log(apiData.response);
			
			// if apiData has property 'status == OK' then successful api request
	    if (apiData.meta.code == 200) {
			
			// are there venues near the lat/lon from the query?
			if(apiData.numResults == 0){
			venuesNear = false;
			} else if(apiData.numResults != 0){
			venuesNear = true;
		}
		console.log("Are there any venues near this location? ANSWER: " + venuesNear);
			//if there are venues near the lat/lon, then find the closest one
			if ( venuesNear == true ) {
				// prepare template 
		        var templateData = {
		            title: siteTitle,
		            searchRadius : searchRadius,
		            closestVenueID : apiData.response.groups[0].items[0].venue.id,
		            closestVenueName : apiData.response.groups[0].items[0].venue.name
		        }

		    	return res.render("index.html", templateData);
		    }
	    }
	});
};

exports.foursquare_checkin = function(req, res) {
	//TEST: venue id for brooklyn bridge park is 4bf58dd8d48988d163941735
	if ( venuesNear = true ) {
		var foursquareCheckinURL = "https://api.foursquare.com/v2/checkins/add?oauth_token=WPNMVKWJEDJWPATY30TWPZ1UM5EXCDVPSIMAELV2VXHYVZGL&venueId=503de4dce4b0857b003af5f7&v=20130421";
		request.post(foursquareCheckinURL, function(error, response, data) {
			
			if(error){
				res.send("There was an error requesting the foursquare url.")
			}
			// convert data JSON string to native JS object
			var apiData = JSON.parse(data);

	        if (apiData.meta.code == 200) {
			console.log(data);
			// prepare template data for remote_api_demo.html template
		        var templateData = {
		            title: siteTitle,
		            checkin: apiData.response.checkin
		        }

		        return res.render("index.html", templateData);
		    }

		});
}	
};

//******** OAuth/AccessTokens ********//
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
//************************************//


searchVenues = function(lat, lon, checkin, createVenue){
	//constructing the Foursquare query URL
	var baseURL = "https://api.foursquare.com/v2/venues/explore?";
	var clientInfo = "&client_id=ATEFV1ELBMMHFMU5T1GDFGLVVS150EFF50QKC2ZJOVKT5XKR&client_secret=VMRJQSH0CFTDAI04BG4N3JVSDZFBOQSPAPEVLGEBXUZQD23V";
	var accesToken = "oauth_token=WPNMVKWJEDJWPATY30TWPZ1UM5EXCDVPSIMAELV2VXHYVZGL"
	var latlon = "&ll=" + lat + "," + lon;
	var searchRadius = "&radius=10";

	// make a GET request to explore venues endpoint
	request.get(baseURL + clientInfo + latlon + searchRadius, function(error, response, data)) {

		if(error) {
			res.send("There was an error requesting the foursquare url.")
		}
		// convert data JSON string to native JS object
        var apiData = JSON.parse(data);
        	console.log(apiData.response);

        if(apiData.meta.code == 200) {
        	if(apiData.numResults == 0) {

        		createVenue(lat, lon, venueName) { }
				
				checkin (venueID) { }
			}
        	else if (apiData.numResults != 0) {
        		checkin (venueID)
        	}
    	}
    
    // function to get a lat lon pair from the csv/database

    checkin = function (venueID) {

    }

    createVenue = function (lat, lon, venueName) { 

    }
    
    getLocations = function(csv) {
    	//use the csv parse library to separate a lat lon pair from the csv and store it in results []
    	results [] = csv.parse
    	
    	//for each lat lon pair, run searchVenues, passing in the lat and lon
    	for (r in results) {
    		searchVenues(results[r].lat, results[r].lon, checkin, createVenue)

    	}
    }    
    


    
    
        	}
        }
	}
};



















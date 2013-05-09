var request = require("request");
var moment = require("moment");
var placeModel = require("../models/coyote_model.js");
var async = require("async");
var mongoose = require('mongoose');


// figure out how to refer to process.env file instead of insecurely hardcoding in these codes

var siteTitle = "Urban Coyotes";
//************************************************************************//
//Using node-foursquare just to handle oath/access tokens. See exports at bottom.
var config = {
  'secrets' : {
    'clientId' : process.env.FOURSQUARE_CLIENT_ID,
    'clientSecret' : process.env.FOURSQUARE_CLIENT_SECRET,
    'redirectUrl' : 'http://localhost:5000/callback'
  }
};
var foursquare = require('node-foursquare')(config);
//************************************************************************//
exports.index = function(req, res){
	
	var templateData = {
		title : siteTitle,
		google_maps_key : process.env.GOOGLE_MAPS
	}
  res.render('index.html', templateData);
};

exports.get_places = function(req, res) {

	// query for all places
	var query = placeModel.find({});
	query.select('coyoteName geo checkinShout venueName categoryName');
	query.exec(function(err, allPlaces){

		if (err) {
			res.send("Unable to query database for places").status(500);
		};

		console.log("retrieved " + allPlaces.length + " places from database");

		//build and render template
		var data = {
			status : 'OK',
			places : allPlaces
		};

		// was JSONP requested does querystring have callback
		// allow remote domains to request places json
		if (req.query.callback != undefined) {
			res.jsonp(data);
	
		// 
		} else {
			res.json(data);
		}
		
	});

};


// these are tests of the various API calls; not functional
exports.foursquare_exploreVenues = function (req, res) {
	var searchRadius = 15;
	var foursquareExploreURL = "https://api.foursquare.com/v2/venues/explore?ll=40.7293522372629,-73.9935731839472&client_id=" + process.env.FOURSQUARE_CLIENT_ID + "&client_secret=" + process.env.FOURSQUARE_CLIENT_SECRET + "&v=20130419&radius="+searchRadius;
	
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
	var shout = " "; // 140 character limit for comment on checkin
	if ( venuesNear = true ) {
		var foursquareCheckinURL = "https://api.foursquare.com/v2/checkins/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&venueId=503de4dce4b0857b003af5f7&v=20130421&shout="+ shout;
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

exports.createVenue = function (req, res) {
	
	var foursqaureCreateVenueURL = "https://api.foursquare.com/v2/venues/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&name=test&ll=40.979898,77.34375&primaryCategoryId=4bf58dd8d48988d15f941735";
	request.post(foursqaureCreateVenueURL, function(error, response, data) {
		if(error) {
			res.send("There was an error requesting the foursquare url")
		}
		var apiData = JSON.parse(data);
        	
		//forces the addition of the venue despite close matches. Using 409 code response to re-submit
        if(apiData.meta.code == 409 || apiData.meta.code == 2) {
        	var duplicateKey = apiData.response.ignoreDuplicatesKey;
        	var ignoreDuplicates = "true"; 
        	var foursquareCreateVenueURL = "https://api.foursquare.com/v2/venues/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&name=test&ll=40.979898,77.34375&primaryCategoryId=4bf58dd8d48988d15f941735";	
        	 	//console.log("!!!!!! ducplicate key is   " + duplicateKey);
        	 	request.post(foursquareCreateVenueURL + "&ignoreDuplicatesKey="+ duplicateKey+ "&ignoreDuplicates=" + ignoreDuplicates, function(error, response, data) {
        	 		var apiData = JSON.parse(data);
        				
        				if(apiData.meta.code == 200){
        					
        					var templateData = {
        						venueID : apiData.response.venue.id,
        						venueCategoryID : apiData.response.venue.categories[0].id,
        						venueCategoryName : apiData.response.venue.categories[0].name
        						
        					}
        					return res.render("index.html", templateData)
        				}
        	 	});      	
        };		
        // if all goes well the first time around!
        if(apiData.meta.code == 200){

        	var templateData = {
        		venueID: apiData.response.venue.id,
        		venueCategoryID : apiData.response.venue.categories[0].id,
        		venueCategoryName : apiData.response.venue.categories[0].name

        	}

        	return res.render("index.html", templateData)
        }


	});
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
//THE FOURSQUARE STUFF GOING ON IN THE BACKGROUND
exports.doAll = function(req, res) {

		    
	var checkin = function (accessToken, venueId, shout, callback) {

    	// Constructing the base URL for the checkin API call
		
		var url = "https://api.foursquare.com/v2/checkins/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_TOKEN + "&venueId=" + venueId + "&shout=" + shout + "&v=20130507";
			request.post(url, function(error, response, data) {
				
				if(error){
					res.send("There was an error requesting the foursquare url.")
				}
				// convert data JSON string to native JS object
				var apiData = JSON.parse(data);
				console.log(apiData);
		        if (apiData.meta.code == 200) {
					
					var templateData = {
						checkin : apiData.response.checkin
						
					}	
			    }
			    callback(null, 'done');
			    res.send("index.html", templateData);
			    
			    //----------------da database stuff----------------//

			    var latlonString = apiData.response.checkin.venue.location.lat + "," + apiData.response.checkin.venue.location.lng;
			    var latlonArray = latlonString.split(",");
			    
			    var new_place = placeModel({
			    	coyoteName : apiData.response.checkin.user.firstName,
			    	geo : latlonArray,
			    	checkinShout : apiData.response.checkin.shout,
			    	venueID : apiData.response.checkin.venue.id,
			    	venueName : apiData.response.checkin.venue.name,
			    	categoryID : apiData.response.checkin.venue.categories[0].id,
			    	categoryName : apiData.response.checkin.venue.categories[0].name
				});
			    //save to mongodb
			    new_place.save(function(err){
			    	if(err) {
			    		console.log("There was an error saving to the database");
			    		console.log(err);
			    	}
			    	else {
			    		console.log("New place saved!");
			    		console.log(new_place);
			    	}
			    })
			});

	};

    var createVenue = function (checkin) { 
    	var shout = "test";
    	var categoryId = "4eb1d4dd4b900d56c88a45fd";
    	var venueName = "test";
    	var accessToken = process.env.FOURSQUARE_ACCESS_TOKEN;
    	var clientId = process.env.FOURSQUARE_CLIENT_ID;
    	var clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
    	var lat = "48.458352";
    	var lon = "75.070313";
    	var venueId;
    	var url = "https://api.foursquare.com/v2/venues/add?oauth_token=" + accessToken + "&name=" + venueName + "&ll=" + lat + "," + lon + "&primaryCategoryId=" + categoryId + "&v=20130507";
    		request.post(url, function(error, response, data) {
    			if(error) {
					res.send("There was an error requesting the foursquare url")
				}
				var apiData = JSON.parse(data);
				
				//forces the addition of the venue despite close matches. Using 409 code response to re-submit
		        if(apiData.meta.code == 409 || apiData.meta.code == 2) {
		        	console.log("409/duplicate error");
		        	var duplicateKey = apiData.response.ignoreDuplicatesKey;
		        		request.post(url + "&ignoreDuplicatesKey="+ duplicateKey+ "&ignoreDuplicates=true", function(error, response, data) {
		        	 			
		        	 			if(apiData.meta.code == 200){
		        					console.log("409 error resolved. Carry on.");
		        					venueId = apiData.response.venue.id;
		        					categoryId = apiData.response.venue.categories[0].id;

								}

		        	 	});      	
		        };		
		        
		        if(apiData.meta.code == 200) {
		        	venueId = apiData.response.venue.id;
		        	categoryId = apiData.response.venue.categories[0].id;
		        	
		        }

		        checkin(null, accessToken, venueId, shout);	

    		});
    };


	async.waterfall([

	    createVenue,
		checkin
	        
	], function (err, result) {
	   if(err){
	   	console.log("error happened");
	   } else {
	   	console.log(result);
	   }// result now equals 'done'    
	});
}


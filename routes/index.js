var request = require("request");


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
	}
  res.render('index.html', templateData);
};

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
	
	if ( venuesNear = true ) {
		var foursquareCheckinURL = "https://api.foursquare.com/v2/checkins/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&venueId=503de4dce4b0857b003af5f7&v=20130421";
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

exports.doAll = function(req, res) {
	searchVenues = function(lat, lon, checkin, createVenue){
		//storing variables and constructing the Foursquare query URL
		var baseURL = "https://api.foursquare.com/v2/venues/explore?";
		var clientInfo = "&client_id=" + process.env.FOURSQUARE_CLIENT_ID + "&client_secret=" + process.env.FOURSQUARE_CLIENT_SECRET;
		var accesToken = "oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE;
		var latlon = "&ll=" + lat + "," + lon;
		var searchRadius = "&radius=10";

			//**** make a GET request to explore venues endpoint and kick off the whole shabang ****//
			request.get(baseURL + clientInfo + latlon + searchRadius, function(error, response, data) {

				if(error) {
					res.send("There was an error requesting the initial searchVenues foursquare api request")
				}
				// convert data JSON string to native JS object
		        var apiData = JSON.parse(data);
				
				if(apiData.meta.code == 200) {
		        	if(apiData.numResults == 0) {
		        		venueId = apiData.response.groups[0].items[0].venue.id;
			            venueName = apiData.response.groups[0].items[0].venue.name;

		        		createVenue(lat, lon, venueName);
						checkin(venueId);
					}
		        	else if (apiData.numResults != 0) {
		        		
		        		checkin (venueID);
		        	}
		    	}
		    });
	}
		    
			checkin = function (venueId) {
		    	// Constructing the base URL for the checkin API call
				var foursquareCheckinURL = "https://api.foursquare.com/v2/checkins/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&venueId=" + venueId + "&v=20130421";
					request.post(foursquareCheckinURL, function(error, response, data) {
						
						if(error){
							res.send("There was an error requesting the foursquare url.")
						}
						// convert data JSON string to native JS object
						var apiData = JSON.parse(data);

				        if (apiData.meta.code == 200) {
							console.log(data);
							var title = siteTitle;
					        var checkin = apiData.response.checkin;
					    }

					});

			};

		    createVenue = function (lat, lon, venueName, categoryId) { 
		    	var foursqaureCreateVenueURL = "https://api.foursquare.com/v2/venues/add?oauth_token=" + process.env.FOURSQUARE_ACCESS_CODE + "&name=" + venueName + "&ll=" + lat + "," + lon + "&" + "primaryCategoryId=" + categoryId;
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
				        		request.post(foursquareCreateVenueURL + "&ignoreDuplicatesKey="+ duplicateKey+ "&ignoreDuplicates=" + ignoreDuplicates, function(error, response, data) {
				        	 		var apiData = JSON.parse(data);
				        				if(apiData.meta.code == 200){
				        					venueID = apiData.response.venue.id;
				        					categoryID = apiData.response.venue.categories[0].id;
				        					
										}
				        	 	});      	
				        };		
				        // if all goes well the first time around!
				        if(apiData.meta.code == 200){
							venueID = apiData.response.venue.id;
				        	categoryID = apiData.response.venue.categories[0].id;

				        }	
		    		});
		    };

};


















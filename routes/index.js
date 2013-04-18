
/*
 * GET home page.
 */

 var siteTitle = "Urban Coyotes";

exports.index = function(req, res){

	var templateData = {
		title : siteTitle,
	}
  res.render('index', templateData);
};


exports.foursquare_postVenue = function(req, res) {
	var templateData = {

	}
res.render('foursquare_postVenue', templateData);


};

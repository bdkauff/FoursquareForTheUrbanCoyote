
/*
 * GET home page.
 */

 var siteTitle = "Skeleton";

exports.index = function(req, res){

	var templateData = {
		title : siteTitle,
	}
  res.render('index', templateData);
};

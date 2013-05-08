var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// define place schema
var PlaceSchema = new Schema({
	coyoteName : { type: String, required: true},
	geo : { type: [Number], index: { type: '2dsphere', sparse: true } },
	checkinShout : {type: String, required: true},
	venueID : {type: String, required: true},
	venueName: {type: String, required: true},
	categoryID : {type: String, required: true},
	categoryName : {type: String, required: true}

})

// export 'Place' model
module.exports = mongoose.model('Place', PlaceSchema);
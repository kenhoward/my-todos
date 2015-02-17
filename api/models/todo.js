var mongoose = require('mongoose');

var schema = mongoose.Schema({
	title: String,
	completed: { Boolean, default: false },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 'Types.ObjectId' is the object of a user on the User schema
})

module.exports = mongoose.model('Todo', schema);
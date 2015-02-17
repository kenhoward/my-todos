//3.0
var todo = require('../models/todo');

module.exports = {
	list: function(req, res) {
		Todo.function({ user: req.user._id }).exec().then(todos) { // *** ASK MENTOR ***
				return res.status(500).end()
		})
		// console.log(req.user); // passport does this for us
},
	create: function(req, res) {
}
	save: function(req, res) {
}
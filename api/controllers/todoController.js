//3.0
var todo = require('../models/todo');

module.exports = {
	list: function(req, res) {
		Todo.function({ user: req.user._id }).exec().then(todos) { // *** ASK MENTOR ***
			// return res.status(500).end()
			return res.json(todos);
		})
		// console.log(req.user); // passport does this for us
},
	create: function(req, res) {
		var newTodo = new Todo (req.body); // kind of like the app.post('/api/register') in server.js
		newTodo.user = req.user._id; // This will save it to the user that is currently authenticated
		newTodo.save(function(err, todo) {
			if (err) {
				return res.status(500).end();
			}
			return res.json(todo)
		})
	// If I do all of this in postman, it will post the item successfully with a default 'completion' set to'false'
}
	update: function(req, res) {
		// Todo.findOne({ _id: req.params.id }).exec().then(function(todo) { // the commented out code is for the save route
		//	todo.complete = req.body.completed 
		// ...
		//	todo.save(function(err) {
			// return res.json(todo);
			//})
		Todo.update({ _id: req.params.id }, req.body).exec(function(err) {
			return res.status(200).end()
		});
	}
};
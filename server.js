// INITIALLY GIVEN
var express = require('express');

// 2.0
var bodyParser = require('body-parser');
var session = require('session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('./api/models/User');
// 3.0
var todoController = require('./api/controllers/todoController')
var userController = require('./api/controllers/userController')

mongoose.connect('mongodb://localhost/todos'); // connecting the mongoose up

passport.user(new LocalStrategy({
	usernameField = 'email'
	passwordField = 'password'
}, function(username, password, done) {
	// Now we need to find the user and compare the information (email/password). So we run a 'QUERY'
	User.findOne({ email: username }).exec().then(function(user) { // exec() means execute the QUERY ^ we just defined // .then presumes there is no error
		if (!user) { // 'if no user'
			return done(null, false); // 1st param is null, 2nd is false
		}
		// if there is a user:
		// Mehthod was created in the user schema already:
		user.comparePassword().then(function(isMatch) { // again, from the user.js!
			// if no password match:
			if (!isMatch) {
				return done(null, false); // there is no user so return false
			}
			return done(null, user); // 2nd param is a user object // so at this point they have authenticated the local user
		});
	});
}));

passport.serializeUser(function(user, done) {
	// input user model (mongoose) We can do whatever follows the mongoose model
	done(null, user); // instead of storing the entire user we can do user.__id
});

passport.deserializeUser(function(obj, done) {
	// user object (json) We can only use the json model
	done(null, obj); // instead of storing the entire obj we can do obj.__id
})

// INITIALLY GIVEN
var app = express();
app.use(express.static(__dirname+'/public'));
// 2.0
app.user(bodyParser.json());
app.use(session{
	secret: 'adkfj32#8237kdjf' // whatever I want
});
app.use(passport.initialize());
app.use(passport.session());

app.post('/api/auth', passport.authenticate('local'), function(req, res) { // checking and authorizing an existing user
	// authenticating the user
	// if auth is not successfull, passport will automatically return an error message
	//assuming that /auth is successful:
	return res.status(200).end(); // can also return a message
	// in postman, for example, when we go to /api/auth it will give us a 200 OK message
});

app.post('/api/register', function(req, res) { 
	//creating a new user
	// what if there is a repeat email, it won't work because in our model we made it unique
	var newUser = new User(req.body);
	newUser.save(function(err, user) { // .save will save it // there is a cb
		if (err) { // tells the user that we have an error
			return res.status(500).end() // 500 - something went wrong // look up differences between **RES.JSON & RES.SEND**
			// this ^ won't help our user that much, but we can fill in whatever we want, to let them know it won't work
		}
		return res.json(user); // This is related to when I am in **POSTMAN**, that json information will upload and save as user (kind of an ah-ha moment)
		// after the user sends that object information (email/password) it will give me their objectId
		// If I wanted to automatically have the user login after registration, I would do something like the below function (not exactly like this:
		// passport.authenticate('local')(req, res);
		// I need to figure out how to make this ^ work 
	});
});

//3.0

var isAuthed = function(req, res, next) { // before you can access the below GETs and POSTs you need to be authenticated
	if (!req.isAuthenticated()) {
		return res.status(403).end();
	}
	return next();
};

app.get('/api/todos', isAuthed, todoController.list) { // I had the function in here <function(req, res)> but I moved that to todoController WHICH I required above
	//fecth a list of todos
});
app.post('/api/todos', isAuthed, todoController.create) {
	//create a new todo
});

app.post('/api/todos/:id', isAuthed, todoController.save) { // why ID, so we can only save one todo item at once
	//save/update the todo item
});

app.get('/api/profile', isAuthed, userController.profile) {
	//return user's profile
});


// INITIALLY GIVEN
app.listen(8080);
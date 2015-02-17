# my-todos
A "full stack" review project

## Objective
This repo is meant to help you "connect the dots" between back end, server side development with Mongo/mongoose and front end Angular development.

### Step 1: Model your Data 

****************************************************************************************
(I CREATED A NEW FOLDER, API, THAT HAS TWO ADDITIONAL FOLDERS, 'CONTROLLERS' & 'MODELS')
****************************************************************************************


Clone the project, and check out the dummy data that populates the bare bones Angular app. This should give you an idea of what data we need to model on the server side.

Create the following models:

#### User 

************************
(SIMPLY CREATE USER.JS)
************************

Our app will be a simple todo list for an authenticated user. We'll need to have a User model that represents a single user in our app. This model will need fields like email, password, and any other fields that could make our users unique.

* Use a `.pre('save'` option to encrypt user passwords prior to saving using bcrypt. 

********************************************************************************************************************************************************
^ ON USER.JS (1.0) lines: 

schema.pre('save', function(next) {
	var user = this; // storing the reference to 'this' // 
	if (!user.isModified('password')) { // avoids re-encrypting their password 
		return next() // if the haven't modified, move on to next
	}
	// if they did, do this:
	bcrypt.genSalt(12, function(err, salt) { // the number is the work facto NOT THE 'SALT' - default is 10 // but this makes it unique to this server
		if (err) {
			return next(err) // this tells mongoose that there is a problem
		}
		bcrypt.hash(user.password, salt, function(err, hash) { // encrypt or hash our password, pass in the user password, the salt previously created
			// now that we have the hash:
			user.password = hash;
			return next();
		});
	});
});

schema.methods.comparePassword = function(pass) { // compares users password during login // placeholder 'pass' can be anything
	var deferred = q.defer() // this facitilitates the CB function below // it's a promise
	// when we compare passwords in a collection, these passwords/hashes are unable to be decrypted/cracked. We compare the 'encryption values' 
	// this is done by bcrypt...
	bcrypt.compare(pass, this.password, function(err, isMatch) { // last function is a cb with 'err' almost the first, then a boolean // using a cb that makes it asynchronous so we need a promise to facilitate this
		if (err) {
			// console.log('PANICCCCC!', err); // before, without the promise
			deferred.reject(err);
		}
		// return isMatch // before without the promise
		else { deferred.resolve(isMatch);
		}
	})
	return deferred.promise;

***AT THE TOP (LINES 2 -3)***
	var bcrypt = require('bcrypt')
	var q = require('q');

* Create a `comparePassword` schema method that will allow for easy comparison of user-supplied password attempts.
**********************************************************************************************************************************************************

#### Todo
This represents a single todo item. It should have some sort of title or description as well as a status. You could also want to add in some timestamp fields for tracking *when* it was completed. Also, make sure the schema includes a reference to the `User` model. We *could* embed todos as a field in `User`, but then it makes the API for getting todos, PUTting todos all linked to the user. Separating the two make sense in the context of what we want to do. Todos are not just a subfield or property of `User`, they are a model/collection all their own, so let's treat them as such.

*******************************************************************************************************************************
var mongoose = require('mongoose');

var schema = mongoose.Schema({
	title: String,
	completed: { Boolean, default: false },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // 'Types.ObjectId' is the object of a user on the User schema
})

module.exports = mongoose.model('Todo', schema);
*******************************************************************************************************************************

### Step 2: Create Auth logic
Because no one can really get todo items without a user context (we don't want a global todo list), we need to write the auth logic. We could do this a few different ways, but let's use Passport.

#### Install and configure passport-local
* Make sure you implement `serializeUser` and `deserializeUser`, even if you're using the basic defaults of those methods.
* Configure a LocalStrategy in your code. Keep in mind, if you used `email` as your User field that the user will provide in order to log in, you'll need to tell LocalStrategy that your `usernameField` is actually `email`, like so:

```javascript
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, 
	function(username, password, done) {
		//find user here
	});
}));
```

* As the main configuration for LocalStrategy, you'll need to do a User lookup and return `done`. Make sure you 1) find the user by email, and 2) compare the password provided with the stored hashed password. If you have a valid user after these checks, pass it into the `done` function.
* Create an `/api/auth` endpoint that will simply use your local passport implementation. Have it return a 200 if it succeeds.
* Create an `/api/register` endpoint that saves a new user identified by email and password into the db. Make sure you don't duplicate users.

******************************************************************************************************************************
*** LOOK AT PASSPORT DOCUMENTATION FOR LOCAL USER ***

***NOW IN SERVER.JS***

***AT THE TOP***
// INITIALLY GIVEN
var express = require('express');

// 2.0
var bodyParser = require('body-parser');
var session = require('session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('./api/models/User');

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

// INITIALLY GIVEN
app.listen(8080);
*******************************************************************************************************************************

### Step 2: Create the API
Let's create the server-side code that will power our todo app. 

We'll want some basic CRUD routes for our app:

**Note: make sure the user is authenticated when you write these endpoints. You might write an `isAuthed` middleware function to make this easier.**

#### /api/todos
* **GET** Retrieve a list of todos for the current user
* **POST** Add a new todo for the current user

#### /api/todos/:id
* **PUT** Modify a todo item

#### /api/profile
* **GET** Get the current user's profile

Test all your endpoints with Postman thoroughly before moving on to the next step.

*******************************************************************************************************************************

*******************************************************************************************************************************

### Step 3: Bring it all together

With our API functioning, we just need to connect our front end to our back end.

#### Complete the services.
Right now, the todo and profile services are just serving dummy data. Make sure each service call is pointing to the corresponding API endpoint.

#### Wire up the controllers.
Have each controller, where applicable, call the Services so that the data being fetched, updated, and added all work as expected.

### Step 4: Go Beyond
Notice that our app doesn't really work very well when we're logged out. We just get 403 codes under the hood and don't do anything about it. We can use a cool feature of angular called HTTP interceptors to globally catch all "unauthed" messages and subsequently redirect the user to the login page. Something like this should do the trick:

```javascript
//in your app.js config, after the routing part
$httpProvider.interceptors.push(function($location) {
	return {
		responseError: function(response) {
			if (response.status === 403) {
				$location.path('/auth');
			}
		}
	}
});
```

* Also, tackle making the User Profile page editable, so a user can edit his/her information.
* How could you make the navigation links customize themselves based on if the user is logged in or not? For example, instead of saying "Profile" it could say "Log in" if the user isn't currently logged in. 

var mongoose = require('mongoose');
var bcrypt = require('bcrypt')
var q = require('q');

var schema = mongoose.Schema({
	email: { String, unique: true }, // creating a unique key on the 'schema level'
	password: String,
	gender: String,
	age: Number,
	bio: String
	// todos: [todo.schema] // One way of doing this, if not, I have to do in the todo.js model : user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
	// ALSO! We would need to require 'todo' above if I did that within this schema.
});

// 1.0
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

}

module.exports = mongoose.model('User', schema);
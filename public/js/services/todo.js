angular.module('MyTodos').service('TodoService', function($q, $http) {
	this.getTodos = function() {
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: '/api/todos'
		}).then(function(response) {
			deferred.resolve(response.data);
		});
		// deferred.resolve([
		// 	{
		// 		title: 'Grab eggs',
		// 		completed: false
		// 	},
		// 	{
		// 		title: 'Visit mom',
		// 		completed: false
		// 	},
		// 	{
		// 		title: 'Pay bills',
		// 		completed: true
		// 	}
		// ]);
		return deferred.promise;
	};
	this.save = function(todo) {
		var deferred = $q.defer();
		deferred.resolve(true);
		return deferred.promise;
	};
});
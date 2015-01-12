/*
Copyright (c) 2015 David Rodenas

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/
(function(angular) {

	angular
		.module('drpxUpdateable', [])
		.factory('Updateable', UpdateableFactory);

	UpdateableFactory.$inject = ['$rootScope'];
	function UpdateableFactory  ( $rootScope ) {
		/* jshint validthis: true */

		function Updateable() {
			this.$$observers = [];
		}

		Updateable.prototype.$observe = $observe;
		Updateable.prototype.$update = $update;
		Updateable.prototype.$unobserve = $unobserve;

		Updateable.createBroadcaster = createBroadcaster;

		function createBroadcaster(event) {
			var broadcaster, notifying;

			return function broadcaster() {
				if (notifying) { return; }

				notifying = true;
				$rootScope.$applyAsync(function broadcasterBroadcast() {
					notifying = false;
					$rootScope.$broadcast(event);
				});
			};
		}


		return Updateable;
	}

	function $observe(observer) {
		this.$$observers.push(observer);
	}

	function $update() {
		angular.forEach(this.$$observers, function notifyWatchers(observer) {
			observer();
		});
	}		

	function $unobserve(observer) {
		var idx;
		idx = this.$$observers.indexOf(observer);
		if (idx !== -1) {
			this.$$observers.slice(idx, 1);
		}
	}

})(angular);

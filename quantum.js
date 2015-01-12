/*
Copyright (c) 2015 David Rodenas

Permission is hereby granted, free of charge, 
to any person obtaining a copy of this software 
and associated documentation files (the "Software"), 
to deal in the Software without restriction, 
including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to 
whom the Software is furnished to do so, subject to the 
following conditions:

The above copyright notice and this permission notice 
shall be included in all copies or substantial portions 
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE 
USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(angular) {

	angular
		.module('drpxQuantum', [])
		.value('Quantum', Quantum);

	function Quantum() {
		this.$$entangles = [];
		this.$$timestamp = 1;
	}

	Quantum.prototype.$entangle = $entangle;
	Quantum.prototype.$update = $update;
	Quantum.prototype.$untangle = $untangle;

	Quantum.getter = getter;
	Quantum.getterSetter = getterSetter;
	Quantum.setter = setter;


	function getter(fn) {
		var args, cache, timestamp;

		if (fn.length > 0) {
			args = [];
			cache = [];
			return function observeWithArgs() {
				var i, l, swapArgs, swapCache;

				// if timestamp does not match, clear cache
				if (timestamp !== this.$$timestamp) {
					cache.length = 0;
					args.length = 0;
					timestamp = this.$$timestamp;
				} 

				// find current arguments
				for (i = 0, l = args.length; i < l && !angular.equals(args[i], arguments); i++) {}

				if (i === l) {
					// not found recompute current argument
					args.unshift(angular.copy(arguments, args));
					cache.unshift(fn.apply(this, arguments));
				} else if (i > 0) {
					// not first, put to begin
					swapCache = cache[i];
					swapArgs = args[i];
					cache[i] = cache[0];
					args[i] = args[0];
					cache[0] = swapCache;
					args[0] = swapArgs;
				}

				return cache[0];
			}
		} else {
			return function observeWithoutArgs() {
				if (timestamp !== this.$$timestamp) {
					cache = fn.apply(this, arguments);
					timestamp = this.$$timestamp;
				}

				return cache;
			}
		}
	}

	function getterSetter(getter, setter) {
		setter = Quantum.setter(setter);
		getter = Quantum.getter(getter);

		return function getterSetter() {
			if (arguments.length > 0) {
				setter.apply(this, arguments);
			}

			return getter.call(this);
		}
	}

	function setter(fn) {
		return function setterWithTouch() {
			fn.apply(this, arguments);
			this.$update();
		}
	}

	function $entangle(quantum) {
		this.$$entangles.push(quantum);
		this.$$timestamp = quantum.$update(this.$$timestamp);
	}

	function $update(timestamp) {
		if (timestamp) {

			// asking for its own timestamp and update
			if (timestamp > this.$$timestamp) {
				// I'll should update me and my entangles
				this.$$timestamp = timestamp;
				angular.forEach(this.$$entangles, function touchEntangles(quantum) {
					this.$$timestamp = quantum.$update(this.$$timestamp);
				}, this);
			} else {
				// nothing else to do
			}
		} else {

			// I have to update timestamp (first ask biggest)
			angular.forEach(this.$$entangles, function touchEntangles(quantum) {
				this.$$timestamp = quantum.$update(this.$$timestamp);
			}, this);
			// now update
			this.$$timestamp = this.$update(this.$$timestamp + 1);
		}

		return this.$$timestamp;
	}		

	function $untangle(quantum) {
		var idx;
		idx = this.$$entangles.indexOf(quantum);
		if (idx !== -1) {
			this.$$entangles.slice(idx, 1);
		}
	}

})(angular);

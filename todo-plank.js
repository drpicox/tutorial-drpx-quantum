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
angular.module('todoApp', [])
	.controller('TodoController', ['$scope', function($scope) {

		function Todos() {
			this.add = add;
			this.archive = archive;
			this.count = count;
			this.list = $observe(list);
			this.remaining = $observe(remaining);
			this.$touch = $touch;            // Q

			var _todos = [], _timestamp = 0; // Q

			function add(todo) {
				_todos.push(todo);
				todo.todos = this;             // Q
				_timestamp ++;                 // Q
			}
			function archive() {
				var oldTodos = _todos;
				_todos = [];
				angular.forEach(oldTodos, function(todo) {
					if (!todo.done()) _todos.push(todo);
				});
				_timestamp ++;                 // Q
			}
			function count() {
				return _todos.length;
			}
			function list(options) {        // Q
					if (options.limit) {
						options.offset = options.offset || 0;
						options.end = options.offset + options.limit;
					}

					return _todos.slice(options.offset, options.end);
			}
			function remaining() {
				var count = 0;
				angular.forEach(_todos, function(todo) {
					count += todo.done() ? 0 : 1;
				});
				return count;
			}
			function $observe(fn) {          // Q
				var args, cache, timestamp;

				if (fn.length > 0) {
					args = [];
					cache = [];
					return function() {
						var i, l;

						// if timestamp does not match, clear cache
						if (timestamp !== _timestamp) {
							cache.length = 0;
							timestamp = _timestamp;
						} 

						// find current argument
						for (i = 0, l = args.length; i < l && !angular.equals(args[i], arguments); i++) {}

						// recompute current argument
						if (i === l) {
							args.unshift(angular.copy(arguments, args));
							cache.unshift(fn.apply(this, arguments));
							return cache[0];
						} else {
							return cache[i];
						}
					}
				} else {
					return function() {
						if (timestamp !== _timestamp) {
							cache = fn.apply(this, arguments);
							timestamp = _timestamp;
						}

						return cache;
					}
				}
			}
			function $touch() {              // Q
				_timestamp++;
			}
		}

		function Todo(data) {
			this.text = text;
			this.done = done;

			var _text, _done;
			_text = data.text || '';
			_done = data.done || false;

			function text(newText) {
				if (angular.isDefined(newText)) {
					_text = newText;
					if (this.todos) {
						this.todos.$touch();
					}
				}
				return _text;
			}
			function done(newDone) {
				if (angular.isDefined(newDone)) {
					_done = newDone;
					if (this.todos) {
						this.todos.$touch();
					}
				}
				return _done;
			}
		}

		var vm = this;

		vm.todos = new Todos();
		vm.todos.add(new Todo({text:'learn angular', done:true}));
		vm.todos.add(new Todo({text:'build an angular app', done:false}));

		$scope.addTodo = function() {
			vm.todos.add(new Todo({text:$scope.todoText, done:false}));
			$scope.todoText = '';
		};

		$scope.addMany = function(n) {
			for (i = 0; i < n; i++) {
				vm.todos.add(new Todo({
					text:'Todo '+vm.todos.count(),
					done: Math.random() < 0.5,
				}));
			}
		};

	}]);
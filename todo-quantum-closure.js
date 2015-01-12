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
angular.module('todoApp', ['drpxQuantum'])
	.controller('TodoController', ['Quantum','$scope', function(Quantum,$scope) {

		function Todos() {
			var qm = new Quantum();

			this.add = qm.$setter(add);
			this.archive = qm.$setter(archive);
			this.count = count;
			this.list = qm.$getter(list);
			this.remaining = qm.$getter(remaining);
			this.$quantum = qm;

			var _todos = [];

			function add(todo) {
				todo.$quantum.$entangle(qm);
				_todos.push(todo);
			}
			function archive() {
				var oldTodos = _todos;
				_todos = [];
				angular.forEach(oldTodos, function(todo) {
					if (!todo.done()) _todos.push(todo);
				});
			}
			function count() {
				return _todos.length;
			}
			function list(options) {
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
		}

		function Todo(data) {
			var qm = new Quantum();

			this.text = text;
			this.done = qm.$getterSetter(getDone, setDone);
			this.$quantum = qm;

			var _text, _done;
			_text = data.text || '';
			_done = data.done || false;

			function getDone() {
				return _done;
			}
			function setDone(newDone) {
				_done = newDone;
			}

			// alternate example
			function text(newText) {
				if (arguments.length > 0) {
					_text = newText;
					qm.$touch();
				}
				return _text;
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
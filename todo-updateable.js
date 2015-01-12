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
angular.module('todoApp', ['drpxUpdateable'])
	.factory('todosState', todosStateFactory)
	.factory('Todo', TodoFactory)
	.controller('TodoController', TodoController);

todosStateFactory.$inject = ['Updateable'];
function todosStateFactory  ( Updateable ) {
	var broadcast, state;

	state = {
		list: [],
		add: add,		
		archive: archive,		
		count: count,
		remaining: remaining,
	};

	function add(todo) {
		state.list.push(todo);
		todo.$observe(broadcast);
		broadcast();
	}

	broadcast = Updateable.createBroadcaster('ta.todosChange');

	function archive() {
		var oldTodos = state.list;
		state.list = [];
		angular.forEach(oldTodos, function(todo) {
			if (!todo.done) state.list.push(todo);
			else todo.$unobserve(broadcast);
		}, this);
		broadcast();
	}

	function count() {
		return state.list.length;
	}

	function remaining() {
		var count = 0;
		angular.forEach(state.list, function(todo) {
			count += todo.done ? 0 : 1;
		});
		return count;
	}

	return state;
}

TodoFactory.$inject = ['Updateable'];
function TodoFactory  ( Updateable ) {

	function Todo(data) {
		Updateable.call(this);

		this.text = data.text || '';
		this.done = data.done || false;
	}

	angular.extend(Todo.prototype, Updateable.prototype);

	return Todo;
}

TodoController.$inject = ['Todo','todosState','$scope'];
function TodoController  ( Todo , todosState , $scope ) {

	var vm;

	vm = this;
	vm.addMany = addMany;
	vm.addTodo = addTodo;
	vm.count = 0;
	vm.list = [];
	vm.remaining = 0;
	vm.todoText = '';
	vm.todos = todosState;

	$scope.$on('ta.todosChange', update);
	update();

	activate();

	function activate() {
		vm.todos.add(new Todo({text:'learn angular', done:true}));
		vm.todos.add(new Todo({text:'build an angular app', done:false}));		
	}

	function addMany(n) {
		for (i = 0; i < n; i++) {
			vm.todos.add(new Todo({
				text:'Todo '+vm.todos.count(),
				done: Math.random() < 0.5,
			}));
		}
	}

	function addTodo() {
		vm.todos.add(new Todo({text:vm.todoText, done:false}));
		vm.todoText = '';
	}

	function update() {
		vm.count = todosState.count();
		vm.list = todosState.list.slice(-10);
		vm.remaining = todosState.remaining();
	}
}

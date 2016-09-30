console.log("hola");
/*var vm = new Vue({
  el: "#app",
  data: {
    messages: [],
    input: ""
  },
  methods: {
    post: function(e) {
      socket.emit('chat message', this.input);
      e.preventDefault();
    }
  }
});

socket.on('chat message', function(msg){
  vm.messages.push(msg);
});*/
var socket = io();

var example1 = new Vue({
  el: '#app',
  data: {
    tweets: [
      { user: "John",text: 'Foo' },
      { user: "James",text: 'Bar' }
    ]
  },
  methods: []
});

socket.on('chat message', function(msg){
  vm.messages.push(msg);
});


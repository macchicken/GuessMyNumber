var users={};
var urls={};
var urooms={room1:0,room2:0,room3:0};
urls["/testguess"]="/testGuess.html";
function User(id,name,room) {
   this.id = id;
   this.name = name;
   this.room = room;

   this.getId = function() {
      return id;
   };
   this.getName = function() {
      return name;
   };
   this.getRoom = function() {
      return room;
   };
}

function includeResourceFile(appi,resourcePath){
	appi.get(resourcePath, function(req, res){
	  res.sendFile(__dirname + req.originalUrl);
	});
}
function responseView(appi,url){
	appi.get(url, function(req, res){
	  res.sendFile(__dirname + urls[url]);
	});
}
function simpleChat(){
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	
	
	responseView(app,"/testguess");

	io.sockets.on('connection', function (socket) {
	  socket.emit('connection', { userId: socket.id});
	  //socket.room = 'General';
	  //console.log(socket.room);
	  
	  socket.on('sendMessage', function (data) {
		console.log(data.room);
		socket.join(data.room);
		// socket.broadcast.emit('receiveMessage', { data: data });
		io.sockets.in(data.room).emit('receiveMessage', { data: data });
	  });

	  socket.on('disconnect', function () {
		console.log("DISCONNECT");
		socket.emit('disconnect');
	  });

	});
	
	
	http.listen(20080, function(){
	  console.log('listening on *:20080');
	});
}

simpleChat();
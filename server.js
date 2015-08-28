var users={};
var urls={};
var urooms={room1:0,room2:0,room3:0};
urls["/guess"]="/Guess.html";
function User(id,name,room) {
   this.id = id;
   this.name = name;
   this.room = room;
   this.oponent="";

   this.getId = function() {
      return id;
   };
   this.getName = function() {
      return name;
   };
   this.getRoom = function() {
      return room;
   };
   this.setOponent=function(player){
	  this.oponent=player;
   };
   this.getOponent=function(){
	  return oponent;
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
function sendMessageInRoom(io,roomNum,key,messsage){
	io.sockets.in(roomNum).emit(key,messsage);
}

function guessMain(){
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	
	app.get('/', function(req, res){
	  res.send('<h1>Hello world</h1>');
	});
	responseView(app,"/guess");
	includeResourceFile(app,"/materialize/*");
	includeResourceFile(app,"/jsmodule/*");
	includeResourceFile(app,"/images/*");
	
	io.on('connection', function(socket){
		console.log(socket.id+' a user connected');
		socket.on('user nickname', function(msg){// enter into a room
			console.log('user nickname: ' + msg.nickname);
			users[socket.id]=new User(socket.id,msg.nickname,msg.roomNum);
			if (urooms[msg.roomNum]<2){
				urooms[msg.roomNum]=urooms[msg.roomNum]+1;
				console.log("new user "+msg.roomNum);
				socket.join(msg.roomNum);
				sendMessageInRoom(io,msg.roomNum,'new player',msg.nickname+' connected');
				//if (urooms[msg.roomNum]==2){
					//sendMessageInRoom(io,msg.roomNum,'can guess',true);
					//users[socket.id].setOponent(socket.adapter.rooms[])
				//}
			}else{
				socket.emit('room full',"choose another one");
			}
		});
		socket.on('chat message', function(msg){
			console.log('socket '+socket.id+' message: ' + msg);
			var user=users[socket.id];
			console.log(socket);
			sendMessageInRoom(io,user.getRoom(),'chat message',users[socket.id].getName()+' : '+msg);
		});
		socket.on('guess message', function(msg){
			console.log('socket '+socket.id+' message: ' + msg);
			var user=users[socket.id];
			console.log(socket.adapter.rooms[user.getRoom()]);
			sendMessageInRoom(io,user.getRoom(),'guess message',{gtext:users[socket.id].getName()+' guess: '+msg,plid:id});
		});
		socket.on('user typing', function () {
			var user=users[socket.id];
			sendMessageInRoom(io,user.getRoom(),'typing',users[socket.id].getName()+' is typing');
		});
		socket.on('stop typing', function () {
			var user=users[socket.id];
			sendMessageInRoom(io,user.getRoom(),'stop typing',true);
		});
		socket.on('disconnect', function () {
			var user=users[socket.id];
			console.log(socket.id+' is disconnected');
			if (urooms[user.getRoom()]>0){
				urooms[user.getRoom()]--;
			}
			sendMessageInRoom(io,user.getRoom(),'user leave',users[socket.id].getName()+' leave');
		});
	});
	
	http.listen(20080, function(){
	  console.log('listening on *:20080');
	});
}

guessMain();
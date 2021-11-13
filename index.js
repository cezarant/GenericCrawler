	const express = require('express');
	const path = require('path');
	const app = express();
	var http = require('http').Server(app);	
	var io = require('socket.io')(http);
	var port = process.env.PORT || 3002;
	app.use(express.static(path.join(__dirname, 'public')));
	/***************************  Socket.io ***************************************/
	io.on('connection', function(socket)
	{
	  comunicaAoCliente('conectado com sucesso...'); 	
	  socket.on('messageBroadcast', function(etapaAtual)
	  {	
		console.log(etapaAtual); 	       			
		comunicaAoCliente('comando recebido');	        
	  });
	});
	function comunicaAoCliente(msg)
	{
	      io.emit('messageBroadcast', msg);
	      console.log(msg); 	
	} 
	/*******************************************************************************/
	/***************************  API **********************************************/
	http.listen(port, function(){
		console.log('listening on *:'+ port);
	});
	app.get('/', function(req, res)
	{
	  res.sendFile(__dirname + '/index.html');
	});

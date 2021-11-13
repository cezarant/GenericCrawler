	const express = require('express');
	const path    = require('path');
	const app     = express();
	var http      = require('http').Server(app);	
	var io        = require('socket.io')(http);
	var port      = process.env.PORT || 3002;	
	var data      = undefined;
	app.use(express.static(path.join(__dirname, 'public')));
	/***************************  Socket.io ***************************************/
	io.on('connection', function(socket)
	{
	  comunicaAoCliente({ status:1, msg: 'conectado com sucesso...' , dataHora : recuperaDataHora() }); 	
	  socket.on('messageBroadcast', function(etapaAtual)
	  {	
	      console.log(etapaAtual); 	       			
	      comunicaAoCliente({ status:1, msg: 'comando recebido', dataHora : recuperaDataHora()});	        
	  });
	});
	function comunicaAoCliente(msg)
	{
	      io.emit('messageBroadcast',msg );
	      console.log(msg); 	
	} 
	function recuperaDataHora(){
		data      = new Date();
		var dia     = data.getDate();           // 1-31
		var dia_sem = data.getDay();            // 0-6 (zero=domingo)
		var mes     = data.getMonth();          // 0-11 (zero=janeiro)
		var ano2    = data.getYear();           // 2 dígitos
		var ano4    = data.getFullYear();       // 4 dígitos
		var hora    = data.getHours();          // 0-23
		var min     = data.getMinutes();        // 0-59
		var seg     = data.getSeconds();        // 0-59
		var mseg    = data.getMilliseconds();   // 0-999
		var tz      = data.getTimezoneOffset(); // em minutos	      
		var str_data = dia + '/' + (mes+1) + '/' + ano4;
                var str_hora = hora + ':' + min + ':' + seg + '.'+ mseg;
       		console.log(str_hora);  
                return str_data + ' - ' + str_hora; 
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

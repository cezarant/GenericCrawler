  var socket = io();
  var etapa = 0; 	  
  var fimPaginacao = 0;   	  	  
  var lstModulos = [];	  
  var topicosGeral = [];
  var contador = 0; 
  
  $( document ).ready(function()
  {
      $('#sptelemetria').text('Aguardando...');
  });  
  function iniciarCrawler()
  {	
      interarCrawler(); 						        
  }	  
  function interarCrawler()
  {		
      socket.emit('messageBroadcast','pong');				
  }  
  socket.on('messageBroadcast', function(msgServidor)
  { 		
      $('#sptelemetria').text(msgServidor.dataHora +' - '+ msgServidor.msg);	
      $('#messages').append($('<li>').text(msgServidor.dataHora +' - '+ msgServidor.msg));		
  });	  


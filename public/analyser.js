  var socket = io();
  var metaDadosDvd; 
  var etapa = 0; 	  
  var fimPaginacao = 0;   	  	  
  var lstModulos = [];	  
  var topicosGeral = [];
  var contador = 0; 
  
  $( document ).ready(function()
  {
      $('#sptelemetria').text('Aguardando...');
  });  
  function interarCrawler(comando,valor)
  {		
      socket.emit('messageBroadcast',{ tipo : comando, valor: valor});				
  }  
  function realizaParserCapitulos(item){			
	$("#divResultados").text('');	
	metaDadosDvd = item;
	document.getElementById("fname").value = item.Nome.$t;
	metaDadosDvd.Nome = item.Nome.$t;
	var list = $("#divResultados").append("<ul class=\"list-group\"></ul>");			
	for (var i = 0; i < item.chapters[0].length; i++)		
    	     list.append("<li class=\"\list-group-item\"> Música Número "+ (i + 1) +" <input type=\"text\" id=\"numeroMusica"+ i +"\"\ /></li>");
  }	  	
  function carregaCapitulosDigitados(){		
	for (var i = 0; i < metaDadosDvd.chapters[0].length; i++)
             metaDadosDvd.chapters[0][i].nomeMusica = $("#numeroMusica" + i).val() === '' ? 'Track_'+ i :$("#numeroMusica" + i).val(); 	

	socket.emit('messageBroadcast',{ tipo : 'geramp4', valor: metaDadosDvd });
  }	
  socket.on('messageBroadcast', function(msgServidor)
  { 		      
      switch(msgServidor.status) 	   	
      {
	   case 1: 
		$('#messages').append($('<li>').text(msgServidor.dataHora +' - '+ msgServidor.msg));		
		$('#sptelemetria').text(msgServidor.dataHora +' - '+ msgServidor.msg);	
	   break;
	   case 2: 
		realizaParserCapitulos(msgServidor.msg);
	   break;
	   case 6:
		interarCrawler('ejetar','')		
		$('#sptelemetria').text(msgServidor.dataHora +' - '+ msgServidor.msg);
		break;    	
	   default: 
		$('#messages').append($('<li>').text(msgServidor.dataHora +' - '+ msgServidor.msg));		
		$('#sptelemetria').text(msgServidor.dataHora +' - '+ msgServidor.msg);	
	   break;	
      }	      
  });	  

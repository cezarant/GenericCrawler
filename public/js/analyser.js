  var socket = io();
  var metaDadosDvd; 
  var etapa = 0; 	  
  var fimPaginacao = 0;   	  	  
  var lstModulos = [];	  
  var topicosGeral = [];
  var contador = 0; 
  var capituloDefault = 0; 
  
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
	var $radios = $('input:radio[name=tipodvd]');
	    	
	if(item.chapters[0].hasOwnProperty('ix')){
	      $radios.filter('[value=cc]').prop('checked', true);  	 		
	      for (var i = 0; i < item.chapters.length; i++)		
    	         list.append("<li class=\"\list-group-item\"> Música Número "+ (i + 1) +" <input type=\"text\" id=\"numeroMusica"+ i +"\"\ /></li>"); 	

	      metaDadosDvd.tipodvd = 'cc';  	
        }else{
	      $radios.filter('[value=ccc]').prop('checked', true);  	 	
	      for (var i = 0; i < item.chapters[capituloDefault].length; i++)		
    	         list.append("<li class=\"\list-group-item\"> Música Número "+ (i + 1) +" <input type=\"text\" id=\"numeroMusica"+ i +"\"\ /></li>"); 	
	
	      metaDadosDvd.tipodvd = 'ccc'; 
        }	
  }	  	
  function carregaCapitulosDigitados(){	
	var qtdItens = 0; 

	if(metaDadosDvd.tipodvd === 'cc'){
	     for (var i = 0; i < metaDadosDvd.chapters.length; i++)
               metaDadosDvd.chapters[i].nomeMusica = $("#numeroMusica" + i).val() === '' ? 'Track_'+ i :$("#numeroMusica" + i).val(); 			
	}

	if(metaDadosDvd.tipodvd === 'ccc')
   	     for (var i = 0; i < metaDadosDvd.chapters[capituloDefault].length; i++)
               metaDadosDvd.chapters[capituloDefault][i].nomeMusica = $("#numeroMusica" + i).val() === '' ? 'Track_'+ i :$("#numeroMusica" + i).val(); 

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

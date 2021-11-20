  const $window = $(window);
  var media;  
  var porta = 3002;  	
  var urlPrincipal = 'http://localhost:'+ porta +'/video';
  var statusOfConnect; 
  var selectedMovie; 
  var videoStack = [];   
  var cont = 0;	  
  var movieFolder = "/movies/";
  var statusDesconectado = 1; 
  var statusModal;  
  var contNivel = 0;
  
  $(document).ready(function(e)
  {
	media=document.getElementById("plTeste");	 
	media.addEventListener('ended', (event) => 
	{
		verifyStack();
	});
	buscaDaAPI();       
  });   

  function verifyStack()
  {
	if(videoStack.length > 0)
	{
	   selectedMovie =  videoStack.pop();
       	   playMovie();		
	} 
  }  
  function pushStack()
  {
	if(selectedMovie !== undefined)
	{
		videoStack.push(selectedMovie);
		var ul = document.getElementById("ulVideos");
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(selectedMovie));
		ul.appendChild(li);	
	}	
  }   
  function chooseMovie(diretorio,nome)
  {
    	if(selectedMovie === undefined)
	{
	    selectedMovie = urlPrincipal + '/?video=' + diretorio.nome; 
	    playMovie();  	    
	}else{ 
	   videoStack.push(urlPrincipal +'/?video='+ diretorio.nome);
	} 	    
  }
  function playMovie(){
	if(media.paused)
	{
	   debugger; 		   
	   console.log('selectedMovie',selectedMovie); 
	   media.removeAttribute("src"); 
	   media.setAttribute('src', selectedMovie);	
	   media.pause();		
	   media.load();  
	   media.play();
	   $('#btnPlay').text('Pause');
	}else{
	  media.pause(); 
	  $('#btnPlay').text('Play');
	}	
  } 
  function forwardMovie(){	
	$('#txtTelemetria').text(listVideos[cont]);
	selectedMovie = listVideos[cont]; 
			
	if((cont + 1) >= listVideos.length)
	    cont = 0; 	
        else 
	   cont = cont + 1; 		   
  }     
  function convertMensagem(msg)
  {
      var obj = JSON.parse(msg);
      switch(obj.tipo)
      {
         case 'conexao':
           gerenciaLuzes(obj.status);	  
           break; 
         case 'file': 
           setaValores(obj.valor);
           break;   
      }               	
  }
  function buscaDaAPI() {
        $.ajax(
	{
		method: "GET",
		url: 'http://localhost:'+ porta +'/juke/',
		data: { servico: "video"}
	})
	.done(function(result)
	{		
		for(var i=0;i< result.juke.Itens.length;i++){
		    juke.push(result.juke.Itens[i]);
		}		
		alfabeto = juke; 				        
		setaValores(alfabeto[0].letra,alfabeto[0].bandas);		
	})
	.fail(function(){
		$('#txtTelemetria').text('Erro ao ler o end point de Jukebox');
	});
 }


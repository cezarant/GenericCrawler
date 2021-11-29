var letras         = geraAlfabeto();
var gabarito       = [];
var playList       = [];
var contVariavel   = 0;
var nivel          = 0;
var porta          = 3002;
var media          = undefined; 
var musicaTocando  = false; 
var musicaEscolhida = undefined; 

$(document).ready(function()
{
     start();     
     media=document.getElementById("plTeste");
     media.addEventListener('ended', (event) => 
     {
	musicaEscohida = playList.pop();	
	carregaPlayer(musicaEscohida.id); 
     });	
});  



function exibePlayList(){     
    debugger; 
    $("#subitens").empty();	
    for(var j =0; j < playList.length;j++)		    
       $("#subitens").append('<li class="list-group-item" id="'+ playList[j].id +'">'+ playList[j].descricao + '</li>');		
} 
function start(){     
     $("#subitens").show();
     $("#imgMestre").hide(); 	     
     nivel        = 0; 
     contVariavel = 0; 	     
     gabarito     = letras;      
     exibePlayList();
}

function avancaAlfabeto(){
    if((contVariavel + 1) >= gabarito.length)
	 contVariavel = 0;  
    else 
        contVariavel++;  

    carregaAlfabeto();	
}
function retornaAlfabeto(){
    if((contVariavel - 1) <= -1)
	contVariavel = gabarito.length-1;  
    else 
        contVariavel--;
      
    carregaAlfabeto();
}  
function entraNivel(){
    if ((nivel + 1) < 4){
	nivel = nivel + 1; 
	carregaCard();
    }   	     		    	           
} 
function carregaCard(){
    var resposta = [];
    switch(nivel){
    	case 0:
	   gabarito = letras; 
	   break;
 	case 1:
	   recuperaBandasPorLetra(gabarito[contVariavel].mestre);		   
	   break;	
	case 2: 
	   recuperaAlbunsPorBanda(gabarito[contVariavel].id); 	
	   break; 	
	case 3: 
	   $("#subitens").show();	
	   $("#imgMestre").hide();
	   recuperarMusicasPorAlbum(gabarito[contVariavel].id); 	
	   break; 		 
    } 	    	    
}
function recuperarMusicasPorAlbum(idAlbum){
	var request = $.ajax({
	  url: 'http://localhost:'+ porta +'/musicasporalbum',
	  method: "GET",
	  data: { idAlbum : idAlbum},
	  dataType: "json"
	});
 
	request.done(function(result){	   	   
	   if(result.length  === 0){
	      alert('A Banda Selecionada não possui Albuns cadastrados');
              nivel = 0; 
	      carregaCard();		
	   }else{    	      
	      $("#subitens").empty();		
	      gabarito = [];
	      for(var i=0;i < result.length;i++){
		 gabarito.push({ mestre: result[i].descricao, detalhes: result[i].descricao,id: result[i].track })
                 $("#subitens").append('<li class="list-group-item" id="'+ result[i].track +'">'+ result[i].descricao + '</li>');
              }
              contVariavel = 0;
	      carregaAlfabeto();	
           }
	});
 
	request.fail(function( jqXHR, textStatus ) {
	       $('#txtTelemetria').text('Erro ao ler o end point de Bandas');
	});

} 
function carregaPlayer(track){
	media.removeAttribute("src"); 
        media.setAttribute('src','http://localhost:'+ porta +'/video?video='+ track);	
	media.pause();		
	media.load();  
	media.play();
} 
function tocaMusica(){
      if(!musicaTocando){ 	
	 carregaPlayer(gabarito[contVariavel].id); 
	 musicaTocando = true; 	
      }else{
	 playList.push({ id: gabarito[contVariavel].id, descricao: gabarito[contVariavel].mestre});
      } 
}

function recuperaAlbunsPorBanda(idBanda){    		
        var request = $.ajax({
	  url: 'http://localhost:'+ porta +'/albumporbanda',
	  method: "GET",
	  data: { idBanda : idBanda},
	  dataType: "json"
	});
 
	request.done(function(result){	   	   
	   if(result.length  === 0){
	      alert('A Banda Selecionada não possui Albuns cadastrados');
              nivel = 0; 
	      carregaCard();		
	   }else{    
	      gabarito = [];  
	      for(var i=0;i < result.length;i++)
	         gabarito.push({ mestre: result[i].descricao, detalhes: result[i].descricao , imgMestre: 'img/Bandas/'+ result[i].descricao +'.jpg', id: result[i].id });  		     	       

              contVariavel = 0;
	      carregaAlfabeto();	
           }
	});
 
	request.fail(function( jqXHR, textStatus ) {
	  $('#txtTelemetria').text('Erro ao ler o end point de Bandas');
	});
}
function recuperaBandasPorLetra(letra){    	
	var request = $.ajax({
	  url: 'http://localhost:'+ porta +'/bandaporletra',
	  method: "GET",
	  data: { letra : letra},
	  dataType: "json"
	});
 
	request.done(function(result){
	   debugger; 		   	   
	   if(result.length  === 0){
	      alert('A letra' + letra +' não possui Bandas cadastradas');
              nivel = 0; 
	      carregaCard();		
	   }else{    
	      gabarito  = [];  
	      for(var i=0;i < result.length;i++)
	         gabarito.push({ id: result[i].id , mestre: result[i].descricao, detalhes: result[i].descricao , imgMestre: 'img/banda.jpg' })  		   
		
	      contVariavel = 0;
	      carregaAlfabeto();	
           }
	});
 
	request.fail(function( jqXHR, textStatus ) {
	  $('#txtTelemetria').text('Erro ao ler o end point de Bandas');
	});
} 
function carregaAlfabeto(){           
	$("#imgMestre").show();
	$("#mestre").text(gabarito[contVariavel].mestre);   
	$("#detalhes").text(gabarito[contVariavel].detalhes);	 		 			 	    
	if(nivel === 3)
	{
	  for(var j=0;j < gabarito.length;j++)
	     document.getElementById(gabarito[j].id).style.backgroundColor = 'white';  

	      document.getElementById(gabarito[contVariavel].id).style.backgroundColor = 'green' ;       
	}else{
	  $("#imgMestre").attr("src",gabarito[contVariavel].imgMestre); 
	} 
}

 
	


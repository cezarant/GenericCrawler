var contVariavel = 0;
var nivel        = 0  
var letras       = [{ id: '0', mestre:'H', imgMestre: 'img/h.jpg', detalhes:'Bandas com a letra H' },
                    { id: '0', mestre:'J', imgMestre: 'img/j.png', detalhes:'Bandas com a Letra J' }];
var bandas       = [];
var gabarito     = [];
var porta        = 3002;
var musicas      = [];
var media;  

$(document).ready(function()
{
     start();     
     media=document.getElementById("plTeste");
});  

function start(){
     $("#imgMestre").show();
     $("#subitens").hide();	     
     nivel = 0; 
     contVariavel =0; 	     
     gabarito = letras; 
     carregaAlfabeto();		
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
	   debugger; 
	   recuperaAlbunsPorBanda(gabarito[contVariavel].id); 	
	   break; 	
	case 3: 
	   $("#subitens").show();	
	   $("#imgMestre").hide();
	   debugger; 
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
              debugger; 
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
function tocaMusica(){
	media.removeAttribute("src"); 
        media.setAttribute('src','http://localhost:'+ porta +'/video?video='+ gabarito[contVariavel].id);	
	media.pause();		
	media.load();  
	media.play();
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
	         gabarito.push({ mestre: result[i].descricao, detalhes: result[i].descricao , imgMestre: 'img/disco.jpg', id: result[i].id });  		     	       

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
	   if(result.length  === 0){
	      alert('A letra' + letra +' não possui Bandas cadastradas');
              nivel = 0; 
	      carregaCard();		
	   }else{    
	      gabarito  = [];  
	      debugger; 
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

 
	


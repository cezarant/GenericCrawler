var alfabeto = []; 
var juke = [];   
var contNivel = 0;  
var contVariavel = 0; 
var contEstatico = 0; 
var musicaSelecionada = undefined; 
var musicaCorrente ; 

function carregaAlfabeto(){
    switch(contNivel)
    {
        case 0:            
            setaValores(alfabeto[contVariavel].letra,alfabeto[contVariavel].bandas);
            break; 
        case 1: 
            setaValores(alfabeto[contVariavel].nome,alfabeto[contVariavel].albuns);
            break; 
        case 2: 
            setaValores(alfabeto[contVariavel].nome,alfabeto[contVariavel].musicas);
            break;    
        case 3: 
            setaValores(alfabeto[contVariavel],undefined);
            break;     
    }    
}
function avancaAlfabeto(){
    if(((contVariavel + 1) === alfabeto.length))
	    contVariavel = 0;  
    else 
        contVariavel++;  
    
    carregaAlfabeto();
}
function configuraAlfabeto(){
    switch(contNivel)
    {
        case 0:            
            alfabeto = juke;    
            break; 
        case 1: 
            alfabeto = alfabeto[contVariavel].bandas;
            break; 
        case 2:
            alfabeto = alfabeto[contVariavel].albuns;    
            break; 
        case 3: 
            alfabeto = alfabeto[contVariavel].musicas;    
            break;
    }       
}
function desceNivel(){
    if(contNivel < 3){ 
        contNivel++;    
        configuraAlfabeto();
        contVariavel = 0;  
        carregaAlfabeto();
    }else{
        avancaAlfabeto();
    } 
}
function sobeNivel(){
    contNivel = 0;     
    $("#musicaSel").empty();
    configuraAlfabeto();
    contVariavel = 0;  
    carregaAlfabeto();
}
function retornaAlfabeto(){
    if((contVariavel - 1) <= -1)
	    contVariavel = alfabeto.length-1;  
    else 
        contVariavel--;
      
    carregaAlfabeto();
}  
function setaValores(itemVariavel,subItens){
    if(subItens !== undefined )
    { 
        var urlVideo = '<a href="#" onclick="chooseMovie(\'{0}\')">'+ itemVariavel +'</a>';
        urlVideo = urlVideo.replace('{0}',itemVariavel);
        $("#ulVideos").text(itemVariavel);            
        $("#subItems").empty(); 

        for (let index = 0; index < subItens.length; index++) {
   	    if(subItens[index].nome === undefined)
                $("#subItems").append('<li>'+ subItens[index] + '</li>');
 	    else 
                $("#subItems").append('<li>'+ subItens[index].nome + '</li>'); 			
        }	   
    }else{       			
	if(itemVariavel.nome === undefined){         
           $("#musicaCorrente").text(itemVariavel);           
	   musicaCorrente = itemVariavel;	
        }else{ 
	  $("#musicaCorrente").text(itemVariavel.nome);
	  musicaCorrente = itemVariavel;	 
        }
    } 
 }
 function selecionaMusica(){
      musicaSelecionada = musicaCorrente; 
      chooseMovie(musicaSelecionada);
      $("#musicasSel").append('<li>'+ musicaCorrente.nome + '</li>');   	
	 
 }
 function limparTela(){
    $("#ulVideos").text('');            	    
    $("#musicaSel").empty();	
    $("#subItems").empty(); 
    $('#txtTelemetria').text('');
 }


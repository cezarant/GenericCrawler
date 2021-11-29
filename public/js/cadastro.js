var porta = 3002; 
var ultimaMusica = undefined;
var ultimoDisco =undefined;   

$(document).ready(function(e)
{	
	$("#cadastrar").hide();	
	buscaDaAPI();       
	buscaUltimoTrack();
});   

function buscaDaAPI() {
        $.ajax(
	{
		method: "GET",
		url: 'http://localhost:'+ porta +'/bandas/',
		data: { servico: "video"}
	})
	.done(function(result)
	{		
		var $dropdown = $("#bandas");
		$.each(result, function(){
    			$dropdown.append($("<option />").val(this.id).text(this.descricao));
		});		
		
	})
	.fail(function(){
		alert('Erro ao ler o end point de Jukebox');
	});
}

function buscaUltimoTrack() {
        $.ajax(
	{
		method: "GET",
		url: 'http://localhost:'+ porta +'/ultimoTrack/',
		data: { servico: "video"}
	})
	.done(function(result)
	{		
    	      ultimaMusica= result[0].seq; 
	      buscaUltimoDisco();	
	})
	.fail(function(){
		alert('Erro ao ler o end point de Jukebox');
	});
}

function buscaUltimoDisco() {
        $.ajax(
	{
		method: "GET",
		url: 'http://localhost:'+ porta +'/ultimoAlbum/',
		data: { servico: "video"}
	})
	.done(function(result)
	{		
   	      ultimoDisco= result[0].seq; 		
	})
	.fail(function(){
		alert('Erro ao ler o end point de Jukebox');
	});
}

function criaAlbum() {
	var nomeAlbum = $("#txtNomeDisco").val();
        $.ajax(
	{
		method: "POST",
		url: 'http://localhost:'+ porta +'/criaAlbum?nomeAlbum='+ nomeAlbum
	})
	.done(function(result)
	{		
    	       buscaUltimoDisco();
	})
	.fail(function(){
		alert('Erro ao ler o end point de Jukebox');
	});
}

$("input[name=file1]").change(function() {
    var names = [];
    var list = $("#divResultados").append("<ul class=\"list-group\"></ul>");	    		
    for (var i = 0; i < $(this).get(0).files.length; ++i){
        list.append("<li class=\"\list-group-item\"> Música Número "+ (i + 1) +" <input type=\"text\" id=\"numeroMusica"+ i +"\"\ /></li>"); 	
    }
    $("#cadastrar").show();	 	
    $("input[name=file]").val(names);
});

const path       = require('path');
var alfabeto      = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?';
 
function lendoItens(stdout){	
	var itens = []; 	
	var lines = stdout.split('\n');
	console.log(stdout); 
	lines.map(function(linha){	  	
	        item = { diretorio : '', arquivo : '',  album : '' , title : '' ,composer : '', artist : '',letra : '',bandas : [] };
	 	if((path.extname(linha).toLowerCase() === '.mp3') || 
		   (path.extname(linha).toLowerCase() === '.wma') || 
	           (path.extname(linha).toLowerCase() === '.wmv') ||
	           (path.extname(linha).toLowerCase() === '.mp4') ||
		   (path.extname(linha).toLowerCase() === '.wav')){
			item.diretorio = diretorio; 	
			item.arquivo = linha; 
			itens.push(item);				
	        }else{
		        diretorio = linha;
        	}    			
	});
	return itens; 	
}
function recuperaTagsArquivo(item){
  	 try{
	       const tags = NodeID3.read(item.diretorio.toString().replace(":",'') +"/"+ item.arquivo);
	       item.album = tags.album;
	       item.title = tags.title;
	       item.composer = tags.composer;
	       item.artist = tags.artist; 			
         }catch(ex){
	       console.log(ex.message); 
	 } 
	 return item.title;
} 
function classificaDadosBrutos(dadosBrutos){
	var dicionario = [];    	    
	for(var j = 0;j< alfabeto.length;j++)
		dicionario.push(this.classPorDicionario(dadosBrutos,alfabeto[j])); 
	    			    
	console.log('Dicionario',dicionario); 	
	return dicionario; 	    		    	 
}  	 
function classPorDicionario(itensA,letra){
	var ItemDicionario; 
	var metaDadosMusica; 
	var BandasPorLetra = itensA.filter(x => x.artist !== undefined && x.artist.charAt(0) === letra);
	var BandasSemDuplicata = []; 
	var Bandas = []; 
	console.log('=================================================================');
	console.log('Letra:',letra); 

	if(BandasPorLetra.length > 0){  
	   // Remove as duplicatas por causa de bandas que tem mais de um Album. 
   	   BandasSemDuplicata = Array.from(new Set(BandasPorLetra.map(x => x.artist)));		         	   
	}
	for(var j = 0;j < BandasSemDuplicata.length;j++){	    
	 	var Banda  =  { nome :'', albuns: [] }; 
		Banda.nome = BandasSemDuplicata[j];             	
		var albuns = BandasPorLetra.filter(x => x.album !== undefined && x.artist === Banda.nome);
		console.log('-------------------------------------------');                
		console.log('Albuns:',albuns);         		    	    		
		for(var k =0;k < albuns.length;k++){			
			Banda.albuns.push(
			{
			   nome: albuns[k].album, 
			   musicas: albuns.map(x => x.metamusica)
		  	}); 
		}
		console.log('-------------------------------------------');  
		console.log('Banda:',Banda); 
	        Bandas.push(Banda);	    
	}
	itemDicionario = { letra: letra, bandas: Bandas };	
	return itemDicionario; 		
} 

module.exports = {
   lendoItens,
   recuperaTagsArquivo,
   classPorDicionario,
   classificaDadosBrutos	
};



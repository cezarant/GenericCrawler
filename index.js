	const express     = require('express');
	const path        = require('path');
	const app         = express(); 
	const fs          = require('fs');
	const { exec }    = require("child_process");
        var metaDadosDvd  = undefined; 	
	var http          = require('http').Server(app);	
	var io            = require('socket.io')(http);
	var port          = process.env.PORT || 3002;	
	var data          = undefined;
	var nomeXml       = 'arquivos/capitulos.xml';
	var listas        = "listas/itens.json";
	var nomeDiretorio = 'listas/diretorio.json';
        var parser        = require('xml2json');
	const alfabet     = require('./alfabet.js');
        var dirSemTags    = 'dvds/semtags';
	var dirComTags    = 'dvds/comtags';
	var itens         = [];
	var dicionario    = [];  
	var comandosTag   = [];
	var comandosFFMpeg = [];
        var comandoEjetar  = 'eject'; 
	app.use(express.static(path.join(__dirname, 'public')));
	/***************************  Socket.io ***************************************/
	io.on('connection', function(socket)
	{
	  comunicaAoCliente({ status:1, msg: 'conectado com sucesso...' , dataHora : recuperaDataHora() }); 	
	  socket.on('messageBroadcast', function(etapaAtual)
	  {	
              switch(etapaAtual.tipo){
		  case "listar": 
                        listaDispositivosUsb('blkid && lsdvd -c -Ox /dev/sr0 > '+ nomeXml,'gravacao de arquivo realizada!');
			break;
 		  case "recuperarCapitulos": 
		        recuperaQtdCapitulos();
			break; 	
		  case "geramp4":
			geraArquivosMp4(etapaAtual.valor);
			break;
		  case "classificaItens": 
			listaArquivos();
			break;
		  case "ejetar":
			ejetar();
			break;
		  default:
			comunicaAoCliente({ status:1, msg: 'comando recebido', dataHora : recuperaDataHora()});
	      }  	       				      	        
	  });
	});	
	function geraArquivosMp4(dados){
	    metaDadosDvd = dados;
	    geraMp4(0);	   			   					
	}
	function geraMp4(indiceCapitulo){
	       var comando = 'HandBrakeCLI -i /dev/sr0 -t 1 -c '+ (indiceCapitulo + 1) +'  -e x264 -b 1000 -r 29.97 -w 480 -o "'+ dirSemTags + '/'+ 
		    metaDadosDvd.chapters[0][indiceCapitulo].nomeMusica +'.mp4"';
	       comunicaAoCliente({ status:1, msg:'Metodo GeraMp4. Comando:'+ comando , dataHora : recuperaDataHora()});	
		
	       exec(comando, (error, stdout, stderr) => {	   

		    gerenciaErroComando(error,stderr);			   	
		   
		   if((indiceCapitulo + 1) < metaDadosDvd.chapters[0].length){
		      comunicaAoCliente({ status:1, msg: metaDadosDvd.chapters[0][indiceCapitulo].nomeMusica + '.mp4 criado', dataHora:recuperaDataHora()}); 		
		      indiceCapitulo++;
		      geraMp4(indiceCapitulo); 	
		   }else{   
		      comunicaAoCliente({ status:4, msg:'Fim da geração de Arquivos mp4', dataHora:recuperaDataHora()});
                      geraMetaDados(0);
		   }				   
		   console.log('Comando executado'); 	
	       });       
	}
	function geraMetaDados(indiceCapitulo){
		exec('ffmpeg -i '+ dirSemTags + '/"' + metaDadosDvd.chapters[0][indiceCapitulo].nomeMusica + '.mp4"' +
                     ' -metadata album="' + metaDadosDvd.Nome  +
                     '" -metadata title="'  + metaDadosDvd.Nome  + 
                     '" -metadata artist="' + metaDadosDvd.Nome  +
                     '" -c copy '+ dirComTags + '/"' + metaDadosDvd.chapters[0][indiceCapitulo].nomeMusica + '"m.mp4', (error, stdout, stderr) => {	   

		   gerenciaErroComando(error,stderr);			   
		   
		   if((indiceCapitulo + 1) < metaDadosDvd.chapters[0].length){
		      comunicaAoCliente({ status:1, msg: metaDadosDvd.chapters[0][indiceCapitulo].nomeMusica +
                                          '.mp4 metaDados cadastrados', dataHora:recuperaDataHora()}); 		
		      indiceCapitulo++;
		      geraMetaDados(indiceCapitulo); 	
		   }else{   
		      comunicaAoCliente({ status:4, msg:'Fim da geração de Meta Dados', dataHora:recuperaDataHora()});
		   }				   
		   console.log('Comando executado'); 	
	       });   
	} 
	function recuperaQtdCapitulos(){
	   fs.readFile(nomeXml, function(err, data)
           {		
        	var json = JSON.parse(parser.toJson(data, {reversible: true}));
                var tracks = json.lsdvd.track;		
		var item = { 'Nome': json.lsdvd.title, chapters: tracks.map(x => x.chapter) };		  					 		
		comunicaAoCliente({ status:2, msg: item, dataHora : recuperaDataHora()});
           });
	 }
         function listaArquivos(){	
	   if (fs.existsSync(listas)){ 
		    comunicaAoCliente({ status:1, msg: 'lendo dados do arquivo de itens...', dataHora : recuperaDataHora() }); 
	 	    dicionario = alfabet.classificaDadosBrutos(JSON.parse(fs.readFileSync(listas)));
		    
		    fs.writeFile(nomeDiretorio, JSON.stringify(dicionario), function(err) {
			gerenciaErroComando(err,undefined);			 			 			
		    });		   
   	   }else{
		    exec("ls "+ dirComTags +" -1 -R", (error, stdout, stderr) => {   
			gerenciaErroComando(error,stdout);				    	                       
	 		itens = alfabet.lendoItens(stdout); 
			comunicaAoCliente({ status:1, msg: 'Arquivo de itens carregado...', dataHora : recuperaDataHora() }); 					
                        console.log(itens); 
			buscaDetalhesMp3(0);	
		   });
	  }
	}
	function buscaDetalhesMp3(contador){	
	   if (itens[contador].diretorio !== undefined){	
		var exiftoolComando = "exiftool -j \""+ itens[contador].diretorio.toString().replace(":",'') +"/"+ itens[contador].arquivo +"\"";
	        comandosFFMpeg.push(exiftoolComando); 
		console.log(exiftoolComando); 
           
	       if((contador + 1) < itens.length){	        		   	
      	           contador++;
   	           buscaDetalhesMp3(contador);	
               }else{
	           console.log('Fim do empilhamento de comandos de ffmpeg'); 	
  	           executaComandosFFMpeg(0);
	       }	   
	   }
        }
        function executaComandosFFMpeg(contador){
	    console.log(comandosFFMpeg[contador]);   
	    exec(comandosFFMpeg[contador], (error, stdout, stderr) => {	   
		   gerenciaErroComando(error,stderr);	  
		   
		   try{ 	
			let metaTags = JSON.parse(stdout);			  			       
			itens[contador].metamusica = { diretorio: itens[contador].diretorio.toString().replace(":",''), nome : itens[contador].arquivo }; 	
			itens[contador].album = metaTags[0].Album;
			itens[contador].title = metaTags[0].Title;
			itens[contador].artist = metaTags[0].Artist; 		       
			console.log('MetaTags:',metaTags);
		   }catch(e){
  			gerenciaErroComando(e.message,undefined); 
                   }

	 	   if((contador + 1) < comandosFFMpeg.length){
		      contador++;
		      executaComandosFFMpeg(contador);		
		   }else{              
			fs.writeFile(listas, JSON.stringify(itens), function(err){
	   	          gerenciaErroComando(err,undefined); 
			  comunicaAoCliente({ status:1, msg: 'Arquivo de itens gravado com sucesso', dataHora : recuperaDataHora() });
		        });
		
  		        dicionario = alfabet.classificaDadosBrutos(itens);
		        fs.writeFile(nomeDiretorio, JSON.stringify(dicionario), function(err) {
			   gerenciaErroComando(err,undefined);			 			 
			   
			   comunicaAoCliente({ status:6, msg: 'Arquivo de dicionário gravado com sucesso', dataHora : recuperaDataHora() });
	     	        }); 			      
		   }  	
	      });
        }
	function ejetar(){
              exec('eject', (error, stdout, stderr) => {	   
		   gerenciaErroComando(error,stderr);	  	
              });		
	} 
	/*******************************************************************************/
	/***************************  Metodos Gerais ***********************************/	
	function gerenciaErroComando(error,stderr){
   	    if (error)
	       comunicaAoCliente({ status:1, msg:error.message, dataHora : recuperaDataHora() });           

	    if (stderr)
 	      comunicaAoCliente({ status:1, msg: stderr.message, dataHora : recuperaDataHora() });           
	}         
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
		console.log(`listening on *: ${port} `);
	});
	app.get('/', function(req, res)
	{
	  res.sendFile(__dirname + '/index.html');
	});
	/*******************************************************************************/
	/**************************  Execucao de comando *******************************/
	function listaDispositivosUsb(comando,comandoRetorno){	            
        	exec(comando, (error, stdout, stderr) => {	   
  		   gerenciaErroComando(error,stderr);		   
		   comunicaAoCliente({ status:1, msg:comandoRetorno, dataHora:recuperaDataHora()});				   
		   console.log('Comando executado'); 	
	       });       
  	} 	    	 	

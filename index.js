	const express     = require('express');
	const path        = require('path');
	const app         = express(); 
	const fs          = require('fs');
	const { exec }    = require("child_process");
        var parser        = require('xml2json');
	const alfabet     = require('./alfabet.js');	
	const db          = require('./sqlite.js');	
        var usbDetect     = require('usb-detection'); 
        var metaDadosDvd  = undefined; 	
	var http          = require('http').Server(app);	
	var io            = require('socket.io')(http);
	var port          = process.env.PORT || 3002;	
	var data          = undefined;
	var nomeXml       = 'arquivos/capitulos.xml';
	var listas        = "listas/itens.json";
	var nomeDiretorio = 'listas/diretorio.json';
	var usbUnit       = '';
        var dirSemTags    = 'dvds/semtags';
	var dirComTags    = 'dvds/comtags';
	var itens         = [];
	var dicionario    = [];  
	var comandosTag   = [];
	var comandosFFMpeg = [];
        var comandoEjetar  = 'eject'; 
	var intervalId; 
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
		  case "copiarPenDrive": 
			copiarPenDrive();
			break;
		  default:
			comunicaAoCliente({ status:1, msg: 'comando recebido', dataHora : recuperaDataHora()});
	      }  	       				      	        
	  });
	});	
	function geraArquivosMp4(dados){
	    metaDadosDvd = dados;
	    console.log('Dados:',dados); 
	    if(metaDadosDvd.tipodvd === 'cc'){
	       var subChapters = []; 
	       for(var i = 0;i< metaDadosDvd.chapters.length; i++)
		  subChapters.push(metaDadosDvd.chapters[i]);	       	 

	       metaDadosDvd.chapters[0] = subChapters; 		      		
	    } 
	    console.log('SubChapters:',metaDadosDvd.chapters[0].lenght); 
	    geraMp4(0);	   			   					
	}
	function copiarPenDrive(){
               comunicaAoCliente({ status:4, msg:'Inicio copia Pen Drive...', dataHora:recuperaDataHora()});	
	       var comando = 	'cp ./'+ dirComTags +'/* ' + usbUnit +'/dvds/';
	       console.log(comando); 	
	       exec(comando, (error, stdout, stderr) => {	   
		   gerenciaErroComando(error,stderr);			   			   		   
		   comunicaAoCliente({ status:1, msg:'Fim da Copia pro PenDrive', dataHora:recuperaDataHora()});                  		   
	       });       
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
		    exec("ls "+ dirSemTags +" -1 -R", (error, stdout, stderr) => {   
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
	function verUSBInserido(){   capturaUSBUnit();  }
	intervalId       = setInterval(verUSBInserido, 1500);         
	function comunicaAoCliente(msg)
	{
	      io.emit('messageBroadcast',msg );
	      console.log(msg); 	
	} 
	function capturaUSBUnit(){
	      exec("findmnt -t vfat -o TARGET", (error, stdout, stderr) => {
                   gerenciaErroComando(error,stderr);		  
		   var lines = stdout.split('\n');
		   lines.map(function(item){	 
	   	      if((item !== 'TARGET') && (item !== '')){
			usbUnit = item;	   			
			clearInterval(intervalId);				
		        comunicaAoCliente({ status:1, msg: 'Pen drive identificado:'+  usbUnit , dataHora : recuperaDataHora() });    	
		      }
		   });	    
       });       	

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
		usbDetect.startMonitoring();
		usbDetect.on('add', function(){ comunicaAoCliente({ status:1, msg: 'Pen Drive conectado..sem identificacao', dataHora:recuperaDataHora()});; });	
    		usbDetect.on('remove', function(){ 
		   comunicaAoCliente({ status:1, msg: 'Pen Drive ' + usbUnit + ' removido...', dataHora:recuperaDataHora()});				   
	        intervalId = setInterval(verUSBInserido, 1500); 
                });	
		console.log(`listening on *: ${port} `);
	});
	app.get('/', function(req, res)
	{
	  res.sendFile(__dirname + '/index.html');
	});	
	app.get('/juke',function(req,res){
		res.setHeader('Content-Type', 'application/json');	
	    if (fs.existsSync(listas)){ 
		fs.readFile(nomeDiretorio, "utf8", (err, jsonString) => {
  			if (err){
			    console.log("File read failed:", err);
		            res.end(500);
			}
			var juke = {"Itens": JSON.parse(jsonString) };
    	        	res.end(JSON.stringify({  juke  }, null, 3));	     	 
		});
	    }else{
		res.end(null, 3);	
	    } 
  	});
        app.get('/video/', function(req, res)
        {			
		const path = '/media/cezar/MX-LIVE/dvds/' + req.query.video;
		const fs = require('fs');		
		const stat = fs.statSync(path)
		const fileSize = stat.size
		const range = req.headers.range
	
		if (range){
		    const parts = range.replace(/bytes=/, "").split("-");
		    const start = parseInt(parts[0], 10);
		    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
		    const chunksize = (end-start)+1
		    const file = fs.createReadStream(path, {start, end});

		    const head = {
		      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		      'Accept-Ranges': 'bytes',
		      'Content-Length': chunksize,
		      'Content-Type': 'audio/mpeg',
		    }

		    res.writeHead(206, head);
		    file.pipe(res);

		}else{
		    const head ={ 'Content-Length': fileSize, 'Content-Type': 'audio/mpeg'}	
		    res.writeHead(200, head);
		    fs.createReadStream(path).pipe(res);
	        }            
        });        	
		
	app.get('/bandaporletra',  async (req, res, next) => {
		var Bandas = await db.getOptions(req.query.letra);			
		res.send(Bandas);	
	});

	app.get('/albumporbanda',  async (req, res, next) => {
		var albuns = await db.getAlbums(req.query.idBanda);				        
  	        res.send(albuns);	
	});

	app.get('/bandas',  async (req, res, next) => {
		var albuns = await db.getBandas();				        
  	        res.send(albuns);	
	});	

	app.get('/ultimoTrack',  async (req, res, next) => {
		var albuns = await db.getUltimaMusica('Banda');				        
  	        res.send(albuns);	
	});	

	app.get('/ultimoAlbum',  async (req, res, next) => {
		var albuns = await db.getUltimaMusica('Album');		
		console.log(albuns); 		        
  	        res.send(albuns);	
	});	

	app.post('/criaAlbum',  async (req, res, next) => {
		console.log(req.query.nomeAlbum); 	
		var albuns = await db.criaAlbum(req.query.nomeAlbum);				        
  	        res.send(albuns);	
	});		

	app.get('/musicasporalbum', async (req, res, next) => {
    	   var musicas = await db.getMusicas(req.query.idAlbum);				        
	   console.log(musicas); 
  	   res.send(musicas);	
	});	

	/*******************************************************************************/
	/**************************  Execucao de comando *******************************/
	function listaDispositivosUsb(comando,comandoRetorno){	   
		comunicaAoCliente({ status:1, msg:'Listando capitulos e gravando arquivo XML', dataHora:recuperaDataHora()});	         
        	exec(comando, (error, stdout, stderr) => {	   
  		   gerenciaErroComando(error,stderr);		   
		   comunicaAoCliente({ status:1, msg:comandoRetorno, dataHora:recuperaDataHora()});				   
		   console.log('Comando executado'); 	
	       });       
  	} 	    	 	

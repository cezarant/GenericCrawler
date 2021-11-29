const fs = require("fs");
const dbFile = "2.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;
  });

module.exports = {  
  getOptions: async letra => {    
    try {
        console.log('getOptions',letra);  
	return await db.all("select descricao, id  from Banda  where  letra = '"+ letra +"'");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  getBandas : async idBanda => {
    try {  
      return await db.all(" select id,descricao from banda ");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }	
  }, 	

  getAlbums : async idBanda => {
    try {  
      console.log('Banda:',idBanda);	 
      return await db.all(" SELECT album.descricao, Album.id "  + 
			  " FROM   ALBUM inner join Banda_Album on Banda_Album.id_album = Album.id " + 
			  " where  Banda_Album.id_banda = " + idBanda);
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }	
  },

  getMusicas : async idAlbum => {
    try {
      return await db.all(" select  descricao, id,track  from musica " + 
			  " inner join Album_Musica on musica.id = Album_Musica.id_musica" + 
			  " where Album_Musica.id_album =" +  idAlbum);
    } catch (dbError) {
      console.error(dbError);
    }	
  },

  getUltimaMusica  : async idAlbum => {
    try {
      return await db.all("select seq,name from sqlite_sequence  where  name = '"+ idAlbum +"'");
    } catch (dbError) {
      console.error(dbError);
    }	
  },

  getLogs: async () => {
    try {

      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  criaAlbum : async nomeAlbum => {
    console.log('caralho:',nomeAlbum); 	
    try {
     await db.run("insert into Album (descricao) values ('"+ nomeAlbum +"')");
    } catch (dbError) {
      console.error(dbError);
    }	
  },	
	 	   
  clearHistory: async () => {
    try {
      // Delete the logs
      await db.run("DELETE from Log");

      // Reset the vote numbers
      await db.run("UPDATE Choices SET picks = 0");

      // Return empty array
      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  }
};

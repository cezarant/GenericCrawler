/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");

// Initialize the database
const dbFile = "2.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;
  });

// Our server script will call these methods to connect to the db
module.exports = {
  
  /**
   * Get the options in the database
   *
   * Return everything in the Choices table
   * Throw an error in case of db connection issues
   */
  getOptions: async letra => {
    // We use a try catch block in case of db errors
    try {
      return await db.all("select descricao, id  from Banda  where  letra = '"+ letra +"'");
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
  /**
   * Get logs
   *
   * Return choice and time fields from all records in the Log table
   */
  getLogs: async () => {
    // Return most recent 20
    try {
      // Return the array of log entries to admin page
      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  /**
   * Clear logs and reset votes
   *
   * Destroy everything in Log table
   * Reset votes in Choices table to zero
   */
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

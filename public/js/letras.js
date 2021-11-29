var letras   = [];  
var alfabeto = 'ABCDEFGHIJLKMNOPQRSTUVWXYZ?';
function geraAlfabeto(){
   for(var j = 0;j< alfabeto.length;j++)
       letras.push({ id:0, mestre:alfabeto[j], imgMestre:'img/'+ alfabeto[j] +'/violet.ico', detalhes: 'Bandas com a letra '+ alfabeto[j] }); 
   
   return letras;
}




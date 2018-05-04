var mysql = require ('mysql');
var server = require ('./app.js');

connection = mysql.createConnection({
  host: "localhost",
  user: "swift",
  password: "Swift1",
  database: "miracledb"
});

connection.connect()

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields){
  if (error) throw error;
  console.log (results[0])
});

  
module.exports = connection
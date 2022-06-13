const mysql = require("mysql");
const con = mysql.createConnection({
    host: "sql6.freesqldatabase.com",
    user: "sql6495069",
    password: "pJdJhCxkAT",
    database: "sql6495069",
});

module.exports = function connectDB() {
    con.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Connected!");
        }
    });
}

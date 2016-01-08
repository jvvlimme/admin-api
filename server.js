var express = require('express'),
    morgan = require("morgan"),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    dotenv = require("dotenv").load(),
    consign = require("consign"),
    http = require('http'),
    path = require('path'),
    sslRootCAs = require("ssl-root-cas/latest").inject();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


var app = express();
var server = http.createServer(app);
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

consign().include("server").into(app);

app.get("/", function(req, res) {
    res.send("ok")
})

server.listen(process.env.PORT || 8080, function() {
    var addr = server.address();
});
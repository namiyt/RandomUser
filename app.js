var express		= require("express");
var bodyParser 	= require("body-parser");
var routes		= require("./routes/routes.js");
var app			= express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use('/', routes);

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
	console.log("App running on port", server.address().port);
});
var Express = require('express');
var BodyParser = require('body-parser')
var DBRouter = require('./db_router');

var app = Express();

app.use(BodyParser.json());
app.use('/', Express.static('static'));
app.use('/db', DBRouter);
app.use('/', function(req, res) {
	res.sendStatus(404);
});

var port = 8080;
app.listen(port, function() {
	console.log('listening on port', port);
});

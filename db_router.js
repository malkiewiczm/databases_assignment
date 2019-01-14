var Express = require('express');
var router = Express.Router();
var sqlite3 = require('sqlite3')
var db = new sqlite3.Database('./flowers.db');

router.route('/flowers').get(function(req, res) {
	// get all flowers
	db.all('SELECT * FROM FLOWERS ORDER BY COMNAME ASC', function(err, result) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.json(result);
	});
});

router.route('/flowers/:comname').put(function(req, res) {
	// update a flower
	if (! req.body.GENUS) {
		res.status(409).end('Missing genus');
		return;
	}
	if (! req.body.SPECIES) {
		res.status(409).end('Missing species');
		return;
	}
	if (! req.body.COMNAME) {
		res.status(409).end('Missing common name');
		return;
	}
	db.run('UPDATE FLOWERS SET GENUS = ?, SPECIES = ?, COMNAME = ? WHERE COMNAME = ?', [ req.body.GENUS, req.body.SPECIES, req.body.COMNAME, req.comname ], function(err) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.sendStatus(204);
	});
});

router.route('/sightings/:comname').get(function(req, res) {
	// 10 most recent sightings for a flower
	var stmt = db.prepare('SELECT * FROM SIGHTINGS WHERE NAME = ? ORDER BY SIGHTED DESC LIMIT 10');
	stmt.all(req.comname, function(err, result) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.json(result);
	});
	stmt.finalize();
}).post(function(req, res) {
	// insert a new sighting
	if (! req.body.NAME) {
		res.status(409).end('Missing common name');
		return;
	}
	if (! req.body.PERSON) {
		res.status(409).end('Missing person name');
		return;
	}
	if (! req.body.LOCATION) {
		res.status(409).end('Missing location');
		return;
	}
	if (! req.body.SIGHTED) {
		res.status(409).end('Missing date');
		return;
	}
	db.run('INSERT INTO SIGHTINGS (NAME, PERSON, LOCATION, SIGHTED) values (?, ?, ?, ?)', [ req.body.NAME, req.body.PERSON, req.body.LOCATION, req.body.SIGHTED ], function(err) {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.sendStatus(204);
	});
});

router.param('comname', function(req, res, next, comname) {
	req.comname = comname;
	next();
});

module.exports = router;

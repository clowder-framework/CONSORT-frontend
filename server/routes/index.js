var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var db = require('../db');

var ensureLoggedIn = ensureLogIn();


var router = express.Router();

const baseUrl = process.env.BASE_URL;

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.user) { return res.render('login'); }
	next();
}, function(req, res, next) {
	res.render('home', { user: req.user });
});


module.exports = router;

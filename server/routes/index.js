var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

var ensureLoggedIn = ensureLogIn();

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('login'); }
  next();
}, function(req, res, next) {
  res.render('home', { user: req.user });
});


module.exports = router;

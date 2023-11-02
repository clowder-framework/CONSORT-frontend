const fetch = require("node-fetch");

var express = require('express');
var passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
var db = require('../db');



// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
// passport.use(new GoogleStrategy({
//   clientID: process.env['GOOGLE_CLIENT_ID'],
//   clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
//   callbackURL: '/oauth2/redirect/google',
//   scope: [ 'profile' ]
// }, function verify(issuer, profile, cb) {
//   db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
//     issuer,
//     profile.id
//   ], function(err, row) {
//     if (err) { return cb(err); }
//     if (!row) {
//       db.run('INSERT INTO users (name) VALUES (?)', [
//         profile.displayName
//       ], function(err) {
//         if (err) { return cb(err); }
//         var id = this.lastID;
//         db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
//           id,
//           issuer,
//           profile.id
//         ], function(err) {
//           if (err) { return cb(err); }
//           var user = {
//             id: id,
//             name: profile.displayName
//           };
//           return cb(null, user);
//         });
//       });
//     } else {
//       db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
//         if (err) { return cb(err); }
//         if (!row) { return cb(null, false); }
//         return cb(null, row);
//       });
//     }
//   });
// }));

const CIlogon_idp = [
	{"EntityID":"https://idp.ncsa.illinois.edu/idp/shibboleth","OrganizationName":"National Center for Supercomputing Applications","DisplayName":"National Center for Supercomputing Applications","RandS":true},
	{"EntityID":"urn:mace:incommon:uiuc.edu","OrganizationName":"University of Illinois at Urbana-Champaign","DisplayName":"University of Illinois Urbana-Champaign","RandS":true},
	{"EntityID":"urn:mace:incommon:unc.edu","OrganizationName":"University of North Carolina at Chapel Hill","DisplayName":"University of North Carolina at Chapel Hill","RandS":true},
	{"EntityID":"https://idp.uark.edu/idp/shibboleth","OrganizationName":"University of Arkansas","DisplayName":"University of Arkansas","RandS":true},
	{"EntityID":"https://idp.login.iu.edu/idp/shibboleth","OrganizationName":"Indiana University","DisplayName":"Indiana University","RandS":true}
]
const encodedEntityIDs = CIlogon_idp.map(item => encodeURIComponent(item.EntityID));
const concatenatedEntityIDs = encodedEntityIDs.join(',');

// authenticate use CILogon
passport.use(new OAuth2Strategy({
	state: true,
	authorizationURL: 'https://cilogon.org/authorize?idphint='+concatenatedEntityIDs,
	tokenURL: 'https://cilogon.org/oauth2/token',
	clientID: process.env.CILOGON_CLIENT_ID,
	clientSecret: process.env.CILOGON_CLIENT_SECRET,
	callbackURL: process.env.CILOGON_CALLBACK_URL,
	scope: [ 'profile', 'org.cilogon.userinfo', 'email', 'openid']
}, (accessToken, refreshToken, profile, cb) => {
	fetch('https://cilogon.org/oauth2/userinfo?access_token=' + accessToken)
		.then(function (response) {
			return response.json();
		})
		.then(function (json) {
			process.nextTick(() => cb(null, json));
		})
}))

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


var router = express.Router();

/* GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML page, which contain a button prompting the
 * user to sign in with Google.  When the user clicks this button, a request
 * will be sent to the `GET /login/federated/cilogon` route.
 */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET /login/federated/cilogon
 *
 * This route redirects the user to CILogon, where they will authenticate.
 *
 * Signing in with Google is implemented using OAuth 2.0.  This route initiates
 * an OAuth 2.0 flow by redirecting the user to Google's identity server at
 * 'https://accounts.google.com'.  Once there, Google will authenticate the user
 * and obtain their consent to release identity information to this app.
 *
 * Once Google has completed their interaction with the user, the user will be
 * redirected back to the app at `GET /oauth2/redirect/cilogon`.
 */
router.get('/login/federated/cilogon', passport.authenticate('oauth2'));

/*
    This route completes the authentication sequence when Google redirects the
    user back to the application.  When a new user signs in, a user account is
    automatically created and their Google account is linked.  When an existing
    user returns, they are signed in to their linked account.
*/
router.get('/oauth2/redirect/cilogon', passport.authenticate('oauth2', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/login'
}));

/* POST /logout
 *
 * This route logs the user out.
 */
router.post('/logout', function(req, res, next) {
	req.logout(function(err) {
	    if (err) { return next(err); }
	    res.redirect('/');
    });
	res.clearCookie('connect.sid');
	//res.send({isAuth: req.isAuthenticated(), user: req.user})
});

module.exports = router;

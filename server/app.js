require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var csrf = require('csurf');
var passport = require('passport');
var logger = require('morgan');

var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

var ensureLoggedIn = ensureLogIn();

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
var SQLiteStore = require('connect-sqlite3')(session);

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var rctdbRouter = require('./routes/rctdb');

// Import database connection and migration functions
var { rctdbTestConnection } = require('./rctdb/connection');
var { rctdbMigrate } = require('./rctdb/migrate');

var app = express();

// Database initialization function
async function initializeDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    const isConnected = await rctdbTestConnection();
    
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('🚀 Running database migrations...');
    await rctdbMigrate();
    console.log('✅ Database initialized successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Application will continue but database features may not work properly');
    // Don't exit the process - let the app start even if DB fails
    // This allows for graceful degradation
  }
}

// Initialize database on startup
initializeDatabase();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
// Apply CSRF protection to all routes except API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/rctdb')) {
    return next();
  }
  return csrf()(req, res, next);
});
app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});
app.use(function(req, res, next) {
  if (req.path.startsWith('/api/rctdb')) {
    return next();
  }
  res.locals.csrfToken = req.csrfToken();
  next();
});

//const baseUrl = process.env.BASE_URL;
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/api/rctdb', rctdbRouter);

// redirect any other route back to home route /
// app.use((req,res,next)=>{
// 	res.redirect('/');
// });

// Serve static files from the public folder with the base URL
//app.use(baseUrl, express.static('public'));
app.use('/home',express.static('../dist'));
app.use('/public',express.static('../dist/public'));
app.use('/public', express.static('public'));


app.get('/client',ensureLoggedIn, function (req, res, next){
	// get env variables for header
	var CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
	var APIKEY = process.env.APIKEY;
	var PREFIX = process.env.CLOWDER_PREFIX;
	var options = {
		headers:{
			'hostname': CLOWDER_REMOTE_HOSTNAME,
			'prefix': PREFIX,
			'apikey': APIKEY
		}
	}
	res.json(options); // Use this in src/utils/common in getHeader() method.
});


app.get('/home', ensureLoggedIn, function (req, res, next){
	res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

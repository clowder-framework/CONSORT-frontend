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
var clowderRouter = require('./routes/clowder');

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
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' }),
  rolling: true, // Reset session expiration on each request
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax'
  }
}));

// CORS middleware for all /api/* routes - must be before authentication
app.use(function(req, res, next) {
  if (req.path.startsWith('/api/')) {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-API-Key, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  }
  next();
});

// CSRF protection - exclude API routes
app.use(function(req, res, next) {
  // Skip CSRF for API proxy routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  return csrf()(req, res, next);
});

// Passport authentication - run for all routes including API routes
// CORS headers are already set above, so authentication failures will have CORS headers
app.use(passport.authenticate('session'));

app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

app.use(function(req, res, next) {
  // Skip CSRF token for API proxy routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.locals.csrfToken = req.csrfToken();
  next();
});

//const baseUrl = process.env.BASE_URL;
app.use('/', indexRouter);
app.use('/', authRouter);
// Before clowderRouter's /api/* proxy (which would send /api/rctdb to Clowder).
app.use('/api/rctdb', rctdbRouter);
app.use('/', clowderRouter);

app.use('/home',express.static('../dist'));
app.use('/public',express.static('../dist/public'));
app.use('/public', express.static('public'));


app.get('/client',ensureLoggedIn, function (req, res, next){
	// All API calls are now proxied through Express server
	// This endpoint is kept for backward compatibility but no longer exposes sensitive data
	var PREFIX = process.env.CLOWDER_PREFIX || '';
	var options = {
		headers:{
			'prefix': PREFIX
			// hostname and apikey removed - all API calls are proxied through /api/* routes
		}
	}
	res.json(options);
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
  // Set CORS headers for API routes even on errors
  if (req.path.startsWith('/api/')) {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-API-Key, Authorization');
  }
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // For API routes, return JSON error instead of rendering error page
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({ 
      error: err.message || 'Internal Server Error',
      status: err.status || 500
    });
  }

  // render the error page for non-API routes
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

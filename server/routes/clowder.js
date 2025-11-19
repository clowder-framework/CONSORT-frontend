const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedIn = ensureLogIn();

/**
 * Custom authentication middleware for API routes
 * Returns 401 with CORS headers instead of redirecting
 */
function ensureApiAuth(req, res, next) {
	// CORS headers should already be set by global middleware, but set them again to be safe
	setCorsHeaders(req, res);

	if (!req.user) {
		return res.status(401).json({
			error: 'Unauthorized',
			message: 'Authentication required'
		});
	}
	next();
}

// Configure multer for memory storage to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to set CORS headers
function setCorsHeaders(req, res) {
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
}

/**
 * Helper function to proxy requests to Clowder API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} apiPath - Optional API path (if not provided, extracts from req.path)
 * @param {string} queryString - Optional query string to append
 */
async function proxyToClowder(req, res, apiPath = null, queryString = null) {
	// Set CORS headers for all requests
	setCorsHeaders(req, res);

	try {
		const CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
		const APIKEY = process.env.APIKEY;
		const PREFIX = process.env.CLOWDER_PREFIX || '';

		if (!CLOWDER_REMOTE_HOSTNAME || !APIKEY) {
			return res.status(500).json({ error: 'Server configuration error' });
		}

		// Extract the path after /api/ or use provided apiPath
		const targetApiPath = apiPath || req.path.replace(/^\/api/, '');
		// Reconstruct the full Clowder API path: CLOWDER_REMOTE_HOSTNAME + PREFIX + /api + remaining path
		const targetUrl = `${CLOWDER_REMOTE_HOSTNAME}${PREFIX}/api${targetApiPath}`;

		// Use provided query string or preserve from request
		let finalQueryString = '';
		if (queryString !== null) {
			// If queryString is provided, add ? prefix if it has content
			finalQueryString = queryString ? `?${queryString}` : '';
		} else {
			// Otherwise, preserve query string from request (already includes ?)
			finalQueryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
		}
		const fullUrl = targetUrl + finalQueryString;

		// Prepare headers
		const headers = {
			'X-API-Key': APIKEY,
		};

		// Copy relevant headers from the client request, but exclude host, content-length, and connection
		// For multipart/form-data, we'll set the content-type header later with the boundary
		const contentType = req.headers['content-type'] || '';
		const isMultipart = contentType.includes('multipart/form-data');

		Object.keys(req.headers).forEach(key => {
			const lowerKey = key.toLowerCase();
			if (lowerKey !== 'host' &&
			    lowerKey !== 'content-length' &&
			    lowerKey !== 'connection' &&
			    !(isMultipart && lowerKey === 'content-type')) {
				headers[key] = req.headers[key];
			}
		});

		// Ensure Accept header if not present
		if (!headers['Accept']) {
			headers['Accept'] = 'application/json';
		}

		// Prepare request options
		const options = {
			method: req.method,
			headers: headers,
		};

		// Handle request body for POST/PUT/PATCH
		if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
			if (contentType.includes('application/json')) {
				options.body = JSON.stringify(req.body);
			} else if (isMultipart) {
				// For multipart/form-data, reconstruct FormData
				const formData = new FormData();

				// Add fields from req.body
				if (req.body) {
					Object.keys(req.body).forEach(key => {
						if (req.body[key] !== undefined && req.body[key] !== null) {
							formData.append(key, req.body[key]);
						}
					});
				}

				// Add files from req.files
				if (req.files) {
					if (Array.isArray(req.files)) {
						req.files.forEach(file => {
							formData.append(file.fieldname, file.buffer, {
								filename: file.originalname,
								contentType: file.mimetype
							});
						});
					} else if (typeof req.files === 'object') {
						Object.keys(req.files).forEach(key => {
							const files = Array.isArray(req.files[key]) ? req.files[key] : [req.files[key]];
							files.forEach(file => {
								formData.append(key, file.buffer, {
									filename: file.originalname,
									contentType: file.mimetype
								});
							});
						});
					}
				}

				// Add single file from req.file
				if (req.file) {
					formData.append(req.file.fieldname || 'file', req.file.buffer, {
						filename: req.file.originalname,
						contentType: req.file.mimetype
					});
				}

				options.body = formData;
				// Set content-type header with boundary from form-data
				const formDataHeaders = formData.getHeaders();
				headers['Content-Type'] = formDataHeaders['content-type'];
				options.headers = headers;
			} else if (req.body) {
				options.body = req.body;
			}
		}

		// Make the request to Clowder
		const response = await fetch(fullUrl, options);

		// Set CORS headers again before sending response (in case they were overwritten)
		setCorsHeaders(req, res);

		// Copy response headers
		response.headers.forEach((value, key) => {
			// Skip headers that shouldn't be forwarded
			if (key.toLowerCase() !== 'content-encoding' &&
			    key.toLowerCase() !== 'transfer-encoding' &&
			    key.toLowerCase() !== 'connection' &&
			    key.toLowerCase() !== 'access-control-allow-origin') {
				res.set(key, value);
			}
		});

		// Handle response based on content type
		const responseContentType = response.headers.get('content-type');
		if (responseContentType && responseContentType.includes('application/json')) {
			const data = await response.json();
			return res.status(response.status).json(data);
		} else if (responseContentType && (
			responseContentType.includes('application/octet-stream') ||
			responseContentType.includes('image/') ||
			responseContentType.includes('video/') ||
			responseContentType.includes('audio/') ||
			responseContentType.includes('application/zip') ||
			responseContentType.includes('application/pdf')
		)) {
			// For binary data, send as buffer
			const buffer = await response.buffer();
			return res.status(response.status).send(buffer);
		} else {
			// For text responses
			const text = await response.text();
			return res.status(response.status).send(text);
		}
	} catch (error) {
		console.error('Proxy error:', error);
		// Ensure CORS headers are set even on errors
		setCorsHeaders(req, res);
		res.status(500).json({ error: 'Proxy request failed', message: error.message });
	}
}

/**
 * Middleware to ALWAYS set CORS headers for all requests
 * This must run before ensureLoggedIn so CORS headers are present even if auth fails
 */
function handleCorsHeaders(req, res, next) {
	// Always set CORS headers for all requests
	setCorsHeaders(req, res);

	// Handle OPTIONS preflight requests
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}
	next();
}

/**
 * Middleware to handle CORS preflight requests BEFORE authentication
 * This must run before ensureLoggedIn to prevent redirects on OPTIONS requests
 * @deprecated Use handleCorsHeaders instead
 */
function handleCorsPreflight(req, res, next) {
	if (req.method === 'OPTIONS') {
		setCorsHeaders(req, res);
		return res.status(200).end();
	}
	next();
}

/**
 * Middleware to handle CORS preflight and file uploads
 */
function handleCorsAndUpload(req, res, next) {
	// Handle CORS preflight requests - skip multer for OPTIONS
	if (req.method === 'OPTIONS') {
		setCorsHeaders(req, res);
		return res.status(200).end();
	}

	// Apply multer only for non-OPTIONS requests
	upload.any()(req, res, next);
}

/**
 * Global OPTIONS handler for all /api/* routes
 * This must be registered before any other routes to catch preflight requests
 */
router.options('/api/*', handleCorsHeaders);

/**
 * Specific route: POST /api/datasets/createempty
 */
router.post('/api/datasets/createempty', handleCorsHeaders, handleCorsAndUpload, async function (req, res) {
	await proxyToClowder(req, res, '/datasets/createempty');
});

/**
 * Specific route: POST /api/uploadToDataset/:datasetId
 * Adds extract=false query parameter by default
 */
router.post('/api/uploadToDataset/:datasetId', handleCorsHeaders, handleCorsAndUpload, async function (req, res) {
	// Build query string with extract=false, but allow client to override
	const existingQuery = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
	const queryParams = new URLSearchParams(existingQuery);
	if (!queryParams.has('extract')) {
		queryParams.set('extract', 'false');
	}
	const queryString = queryParams.toString();

	await proxyToClowder(req, res, `/uploadToDataset/${req.params.datasetId}`, queryString);
});

/**
 * Specific route: POST /api/files/:fileId/extractions
 * This route handles JSON requests for triggering extractions
 */
router.post('/api/files/:fileId/extractions', handleCorsHeaders, async function (req, res) {
	console.log('POST /api/files/:fileId/extractions route hit', req.params.fileId);
	await proxyToClowder(req, res, `/files/${req.params.fileId}/extractions`);
});

/**
 * Specific route: GET /api/files/:fileId/blob
 * Adds superAdmin=true query parameter by default
 */
router.get('/api/files/:fileId/blob', handleCorsHeaders, async function (req, res) {
	// Build query string with superAdmin=true, but allow client to override
	const existingQuery = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
	const queryParams = new URLSearchParams(existingQuery);
	if (!queryParams.has('superAdmin')) {
		queryParams.set('superAdmin', 'true');
	}
	const queryString = queryParams.toString();

	await proxyToClowder(req, res, `/files/${req.params.fileId}/blob`, queryString);
});

/**
 * Specific route: GET /api/datasets/:datasetId/listFiles
 */
router.get('/api/datasets/:datasetId/listFiles', handleCorsHeaders, async function (req, res) {
	await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/listFiles`);
});

/**
 * Specific route: GET /api/datasets/:datasetId/metadata.jsonld
 */
router.get('/api/datasets/:datasetId/metadata.jsonld', handleCorsHeaders, async function (req, res) {
	await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/metadata.jsonld`);
});

/**
 * Specific route: GET /api/files/:fileId/getPreviews
 * Adds superAdmin=true query parameter by default
 */
router.get('/api/files/:fileId/getPreviews', handleCorsHeaders, async function (req, res) {
	// Build query string with superAdmin=true, but allow client to override
	const existingQuery = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
	const queryParams = new URLSearchParams(existingQuery);
	if (!queryParams.has('superAdmin')) {
		queryParams.set('superAdmin', 'true');
	}
	const queryString = queryParams.toString();

	await proxyToClowder(req, res, `/files/${req.params.fileId}/getPreviews`, queryString);
});

module.exports = router;


const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedIn = ensureLogIn();

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
 * Proxy route for all Clowder API calls
 * REQUIRES AUTHENTICATION - only logged-in users can access
 */
router.all('/api/*', ensureLoggedIn, function (req, res, next) {
	// Handle CORS preflight requests - skip multer for OPTIONS
	if (req.method === 'OPTIONS') {
		const corsSet = setCorsHeaders(req, res);
		if (!corsSet) {
			return res.status(403).json({ error: 'CORS policy violation' });
		}
		return res.status(200).end();
	}
	
	// Apply multer only for non-OPTIONS requests
	upload.any()(req, res, next);
}, async function (req, res, next) {
	// Set CORS headers for all requests
	setCorsHeaders(req, res);

	try {
		const CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
		const APIKEY = process.env.APIKEY;
		const PREFIX = process.env.CLOWDER_PREFIX || '';

		if (!CLOWDER_REMOTE_HOSTNAME || !APIKEY) {
			return res.status(500).json({ error: 'Server configuration error' });
		}

		// Extract the path after /api/
		const apiPath = req.path.replace(/^\/api/, '');
		// Reconstruct the full Clowder API path: CLOWDER_REMOTE_HOSTNAME + PREFIX + /api + remaining path
		const targetUrl = `${CLOWDER_REMOTE_HOSTNAME}${PREFIX}/api${apiPath}`;

		// Preserve query string
		const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
		const fullUrl = targetUrl + queryString;

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

		// Copy response headers
		response.headers.forEach((value, key) => {
			// Skip headers that shouldn't be forwarded
			if (key.toLowerCase() !== 'content-encoding' &&
			    key.toLowerCase() !== 'transfer-encoding' &&
			    key.toLowerCase() !== 'connection') {
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
		res.status(500).json({ error: 'Proxy request failed', message: error.message });
	}
});

module.exports = router;


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
 * Check if Clowder2 API is enabled
 */
function isClowder2() {
	return process.env.CLOWDER_API_VERSION === 'v2';
}

/**
 * Transform query params for Clowder2: superAdmin -> enable_admin
 */
function transformQueryForClowder2(queryString) {
	const queryParams = new URLSearchParams(queryString);
	if (queryParams.has('superAdmin')) {
		queryParams.set('enable_admin', queryParams.get('superAdmin'));
		queryParams.delete('superAdmin');
	}
	return queryParams.toString() ? `?${queryParams.toString()}` : '';
}

/**
 * Helper function to proxy requests to Clowder API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} apiPath - Optional API path (if not provided, extracts from req.path)
 * @param {string} queryString - Optional query string to append
 * @param {Object} options - Optional overrides: method, body, headers
 */
async function proxyToClowder(req, res, apiPath = null, queryString = null, options = {}) {
	// Set CORS headers for all requests
	setCorsHeaders(req, res);

	try {
		const CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
		const APIKEY = process.env.APIKEY;
		const PREFIX = process.env.CLOWDER_PREFIX || '';
		const useV2 = isClowder2();

		if (!CLOWDER_REMOTE_HOSTNAME || !APIKEY) {
			return res.status(500).json({ error: 'Server configuration error' });
		}

		// Extract the path after /api/ or use provided apiPath
		const targetApiPath = apiPath || req.path.replace(/^\/api/, '');
		// Reconstruct the full Clowder API path: CLOWDER_REMOTE_HOSTNAME + PREFIX + /api[/v2] + remaining path
		const apiPrefix = useV2 ? '/api/v2' : '/api';
		const targetUrl = `${CLOWDER_REMOTE_HOSTNAME}${PREFIX}${apiPrefix}${targetApiPath}`;

		// Use provided query string or preserve from request
		let finalQueryString = '';
		if (queryString !== null) {
			if (queryString) {
				finalQueryString = useV2 ? transformQueryForClowder2(queryString) : (queryString.startsWith('?') ? queryString : `?${queryString}`);
			} else {
				finalQueryString = '';
			}
		} else {
			if (req.url.includes('?')) {
				const existingQuery = req.url.substring(req.url.indexOf('?') + 1);
				finalQueryString = useV2 ? transformQueryForClowder2(existingQuery) : `?${existingQuery}`;
			} else {
				finalQueryString = '';
			}
		}
		const fullUrl = targetUrl + finalQueryString;

		// Prepare headers
		const headers = {
			'X-API-Key': APIKEY,
		};

		// Copy relevant headers from the client request, but exclude host, content-length, and connection
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
		const requestOptions = {
			method: options.method || req.method,
			headers: headers,
		};

		// Handle request body for POST/PUT/PATCH
		const bodySource = options.body !== undefined ? options.body : req.body;
		const method = requestOptions.method || req.method;

		if (['POST', 'PUT', 'PATCH'].includes(method)) {
			if (options.body !== undefined) {
				requestOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
				if (typeof options.body !== 'string') {
					headers['Content-Type'] = 'application/json';
				}
			} else if (contentType.includes('application/json')) {
				requestOptions.body = JSON.stringify(bodySource);
			} else if (isMultipart) {
				// For multipart/form-data, reconstruct FormData
				const formData = new FormData();

				if (req.body) {
					Object.keys(req.body).forEach(key => {
						if (req.body[key] !== undefined && req.body[key] !== null) {
							formData.append(key, req.body[key]);
						}
					});
				}

				if (req.files) {
					if (Array.isArray(req.files)) {
						req.files.forEach(file => {
							// Clowder2 expects "file" field; Clowder v1 uses "File"
							const fieldName = useV2 ? 'file' : (file.fieldname || 'File');
							formData.append(fieldName, file.buffer, {
								filename: file.originalname,
								contentType: file.mimetype
							});
						});
					} else if (typeof req.files === 'object') {
						Object.keys(req.files).forEach(key => {
							const files = Array.isArray(req.files[key]) ? req.files[key] : [req.files[key]];
							files.forEach(file => {
								const fieldName = useV2 && key === 'File' ? 'file' : key;
								formData.append(fieldName, file.buffer, {
									filename: file.originalname,
									contentType: file.mimetype
								});
							});
						});
					}
				}

				if (req.file) {
					const fieldName = useV2 ? 'file' : (req.file.fieldname || 'file');
					formData.append(fieldName, req.file.buffer, {
						filename: req.file.originalname,
						contentType: req.file.mimetype
					});
				}

				requestOptions.body = formData;
				const formDataHeaders = formData.getHeaders();
				headers['Content-Type'] = formDataHeaders['content-type'];
				requestOptions.headers = headers;
			} else if (bodySource) {
				requestOptions.body = bodySource;
			}
		}

		// Make the request to Clowder
		const response = await fetch(fullUrl, requestOptions);

		// Set CORS headers again before sending response
		setCorsHeaders(req, res);

		// Copy response headers
		response.headers.forEach((value, key) => {
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
			const buffer = await response.buffer();
			return res.status(response.status).send(buffer);
		} else {
			const text = await response.text();
			return res.status(response.status).send(text);
		}
	} catch (error) {
		console.error('Proxy error:', error);
		setCorsHeaders(req, res);
		res.status(500).json({ error: 'Proxy request failed', message: error.message });
	}
}

/**
 * Middleware to ALWAYS set CORS headers for all requests
 */
function handleCorsHeaders(req, res, next) {
	setCorsHeaders(req, res);

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}
	next();
}

/**
 * Middleware to handle CORS preflight and file uploads
 */
function handleCorsAndUpload(req, res, next) {
	if (req.method === 'OPTIONS') {
		setCorsHeaders(req, res);
		return res.status(200).end();
	}

	upload.any()(req, res, next);
}

/**
 * Global OPTIONS handler for all /api/* routes
 */
router.options('/api/*', handleCorsHeaders);

/**
 * POST /api/datasets/createempty
 * Clowder v1: POST /api/datasets/createempty with {name, description, space}
 * Clowder2: POST /api/v2/datasets with {name, description, ...} - different body schema
 */
router.post('/api/datasets/createempty', handleCorsHeaders, handleCorsAndUpload, async function (req, res) {
	if (isClowder2()) {
		const body = req.body || {};
		const licenseId = process.env.CLOWDER_DEFAULT_LICENSE_ID || '';
		const datasetBody = {
			name: body.name || 'Untitled Dataset',
			description: body.description || '',
			status: body.status || 'PRIVATE'
		};
		const queryString = licenseId ? `?license_id=${encodeURIComponent(licenseId)}` : '';
		await proxyToClowder(req, res, '/datasets', queryString, {
			method: 'POST',
			body: datasetBody
		});
	} else {
		await proxyToClowder(req, res, '/datasets/createempty');
	}
});

/**
 * POST /api/uploadToDataset/:datasetId
 * Clowder v1: POST /api/uploadToDataset/:id
 * Clowder2: POST /api/v2/datasets/:id/files (form field "file" instead of "File")
 */
router.post('/api/uploadToDataset/:datasetId', handleCorsHeaders, handleCorsAndUpload, async function (req, res) {
	const existingQuery = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
	const queryParams = new URLSearchParams(existingQuery);
	if (!queryParams.has('extract')) {
		queryParams.set('extract', 'false');
	}
	const queryString = queryParams.toString();

	if (isClowder2()) {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/files`, queryString ? `?${queryString}` : null);
	} else {
		await proxyToClowder(req, res, `/uploadToDataset/${req.params.datasetId}`, queryString);
	}
});

/**
 * POST /api/files/:fileId/extractions
 * Clowder v1: POST /api/files/:id/extractions with body {extractor, parameters}
 * Clowder2: POST /api/v2/files/:id/extract?extractorName=X with body {parameters}
 */
router.post('/api/files/:fileId/extractions', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		const body = req.body || {};
		const extractorName = body.extractor || '';
		const parameters = body.parameters || {};
		const queryString = extractorName ? `?extractorName=${encodeURIComponent(extractorName)}` : '';
		await proxyToClowder(req, res, `/files/${req.params.fileId}/extract`, queryString, {
			method: 'POST',
			body: parameters
		});
	} else {
		await proxyToClowder(req, res, `/files/${req.params.fileId}/extractions`);
	}
});

/**
 * GET /api/files/:fileId/blob
 * Clowder v1: GET /api/files/:id/blob
 * Clowder2: GET /api/v2/files/:id (no /blob)
 */
router.get('/api/files/:fileId/blob', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		await proxyToClowder(req, res, `/files/${req.params.fileId}`);
	} else {
		await proxyToClowder(req, res, `/files/${req.params.fileId}/blob`);
	}
});

/**
 * GET /api/datasets/:datasetId/listFiles
 * Clowder v1: GET /api/datasets/:id/listFiles -> object keyed by file id
 * Clowder2: GET /api/v2/datasets/:id/files -> Paged {items, total}; transform to v1-compatible format
 */
router.get('/api/datasets/:datasetId/listFiles', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		setCorsHeaders(req, res);
		try {
			const CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
			const APIKEY = process.env.APIKEY;
			const PREFIX = process.env.CLOWDER_PREFIX || '';
			if (!CLOWDER_REMOTE_HOSTNAME || !APIKEY) {
				return res.status(500).json({ error: 'Server configuration error' });
			}
			const url = `${CLOWDER_REMOTE_HOSTNAME}${PREFIX}/api/v2/datasets/${req.params.datasetId}/files`;
			const response = await fetch(url, {
				headers: { 'X-API-Key': APIKEY, 'Accept': 'application/json' }
			});
			const data = await response.json();
			// Transform Paged {items} to v1 format: object keyed by file id
			console.log('Clowder2 files response:', JSON.stringify(data, null, 2));
			if (data.data && Array.isArray(data.data)) {
				const fileMap = {};
				for (const file of data.data) {
					const id = file.id || file._id;
					if (id) {
						const ct = file.content_type;
						const contentType = typeof ct === 'string' ? ct : (ct && ct.content_type) || 'application/octet-stream';
						fileMap[id] = {
							id,
							filename: file.name || file.filename,
							'contentType': contentType,
							'date-created': file.created,
							size: String(file.bytes || 0)
						};
					}
				}
				return res.status(response.status).json(fileMap);
			}
			return res.status(response.status).json(data);
		} catch (error) {
			console.error('ListFiles proxy error:', error);
			setCorsHeaders(req, res);
			return res.status(500).json({ error: 'Proxy request failed', message: error.message });
		}
	} else {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/listFiles`);
	}
});

/**
 * GET /api/datasets/:datasetId/metadata.jsonld
 * Clowder v1: GET /api/datasets/:id/metadata.jsonld
 * Clowder2: GET /api/v2/datasets/:id/metadata
 */
router.get('/api/datasets/:datasetId/metadata.jsonld', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/metadata`);
	} else {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/metadata.jsonld`);
	}
});

/**
 * POST /api/datasets/:datasetId/usermetadatajson
 * Clowder v1: POST /api/datasets/:id/usermetadatajson
 * Clowder2: POST /api/v2/datasets/:id/metadata
 */
router.post('/api/datasets/:datasetId/usermetadatajson', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/metadata`);
	} else {
		await proxyToClowder(req, res, `/datasets/${req.params.datasetId}/usermetadatajson`);
	}
});

/**
 * GET /api/files/:fileId/getPreviews
 * Clowder v1: GET /api/files/:id/getPreviews
 * Clowder2: GET /api/v2/visualizations/{resource_id}/config - different API
 * For now proxy to same path; Clowder2 may return 404 if previews not available
 */
router.get('/api/files/:fileId/getPreviews', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		// Clowder2 uses visualizations; try /api/v2/visualizations/{file_id}/config
		// If resource_id is file_id, this may work
		await proxyToClowder(req, res, `/visualizations/${req.params.fileId}/config`);
	} else {
		await proxyToClowder(req, res, `/files/${req.params.fileId}/getPreviews`);
	}
});

/**
 * GET /api/extractions/:fileId/statuses
 * Clowder v1: GET /api/extractions/:id/statuses -> {Status, extractorName: "DONE"}
 * Clowder2: GET /api/v2/jobs?file_id=:id -> Paged with items; transform to v1 format
 */
router.get('/api/extractions/:fileId/statuses', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		setCorsHeaders(req, res);
		try {
			const CLOWDER_REMOTE_HOSTNAME = process.env.CLOWDER_REMOTE_HOSTNAME;
			const APIKEY = process.env.APIKEY;
			const PREFIX = process.env.CLOWDER_PREFIX || '';
			if (!CLOWDER_REMOTE_HOSTNAME || !APIKEY) {
				return res.status(500).json({ error: 'Server configuration error' });
			}
			const url = `${CLOWDER_REMOTE_HOSTNAME}${PREFIX}/api/v2/jobs?file_id=${req.params.fileId}`;
			const response = await fetch(url, {
				headers: { 'X-API-Key': APIKEY, 'Accept': 'application/json' }
			});
			const data = await response.json();
			// Transform Clowder2 Paged jobs to v1 format: {Status, listener_id: "DONE"|"Processing"}
			const result = { Status: 'Done' };
			if (data.items && Array.isArray(data.items)) {
				let anyProcessing = false;
				for (const job of data.items) {
					const listenerId = job.listener_id || job.id;
					const status = (job.status || 'CREATED').toUpperCase();
					const done = status === 'DONE' || status === 'COMPLETED';
					result[listenerId] = done ? 'DONE' : 'Processing';
					if (!done) anyProcessing = true;
				}
				if (anyProcessing) result.Status = 'Processing';
			}
			return res.status(response.status).json(result);
		} catch (error) {
			console.error('Extraction status proxy error:', error);
			setCorsHeaders(req, res);
			return res.status(500).json({ error: 'Proxy request failed', message: error.message });
		}
	} else {
		await proxyToClowder(req, res, `/extractions/${req.params.fileId}/statuses`);
	}
});

/**
 * GET /api/thumbnails/:thumbnailId/blob
 * Clowder v1: GET /api/thumbnails/:id/blob
 * Clowder2: GET /api/v2/thumbnails/:id (no /blob)
 */
router.get('/api/thumbnails/:thumbnailId/blob', handleCorsHeaders, async function (req, res) {
	if (isClowder2()) {
		await proxyToClowder(req, res, `/thumbnails/${req.params.thumbnailId}`);
	} else {
		await proxyToClowder(req, res, `/thumbnails/${req.params.thumbnailId}/blob`);
	}
});

/**
 * Catch-all for all other /api/* routes - proxy with path prefix
 * Handles routes like /api/datasets, /api/datasets/:id, /api/files/:id/metadata, etc.
 */
router.all('/api/*', handleCorsHeaders, handleCorsAndUpload, async function (req, res) {
	const targetPath = req.path.replace(/^\/api/, '') || '/';
	await proxyToClowder(req, res, targetPath);
});

module.exports = router;

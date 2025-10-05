const apiKeyManager = require('./apiKeyManager');

function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required. Provide it in X-API-Key header or apikey query parameter'
    });
  }

  if (!apiKeyManager.validateApiKey(apiKey)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or inactive API key'
    });
  }

  next();
}

function requireAdminKey(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

module.exports = { requireApiKey, requireAdminKey };

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const API_KEYS_FILE = path.join(__dirname, 'api_keys.json');

class ApiKeyManager {
  constructor() {
    this.apiKeys = this.loadApiKeys();
  }

  loadApiKeys() {
    try {
      if (fs.existsSync(API_KEYS_FILE)) {
        const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
    return {};
  }

  saveApiKeys() {
    try {
      fs.writeFileSync(API_KEYS_FILE, JSON.stringify(this.apiKeys, null, 2));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  generateApiKey(name = 'Unnamed App') {
    const apiKey = `wa_${uuidv4().replace(/-/g, '')}`;
    this.apiKeys[apiKey] = {
      name,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      requestCount: 0,
      active: true
    };
    this.saveApiKeys();
    return apiKey;
  }

  validateApiKey(apiKey) {
    if (!apiKey || !this.apiKeys[apiKey]) {
      return false;
    }
    
    const keyData = this.apiKeys[apiKey];
    if (!keyData.active) {
      return false;
    }

    keyData.lastUsed = new Date().toISOString();
    keyData.requestCount++;
    this.saveApiKeys();
    return true;
  }

  listApiKeys() {
    return Object.entries(this.apiKeys).map(([key, data]) => ({
      key,
      ...data
    }));
  }

  revokeApiKey(apiKey) {
    if (this.apiKeys[apiKey]) {
      this.apiKeys[apiKey].active = false;
      this.saveApiKeys();
      return true;
    }
    return false;
  }

  deleteApiKey(apiKey) {
    if (this.apiKeys[apiKey]) {
      delete this.apiKeys[apiKey];
      this.saveApiKeys();
      return true;
    }
    return false;
  }
}

module.exports = new ApiKeyManager();

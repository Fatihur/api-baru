const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const WhatsAppClient = require('./whatsappClient');

const API_KEYS_FILE = path.join(__dirname, 'api_keys.json');

class ApiKeyManager {
  constructor() {
    this.apiKeys = this.loadApiKeys();
    this.whatsappClients = {};
    this.pendingSave = false;
    this.saveInterval = null;
    this.startAutoSave();
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
      this.pendingSave = false;
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  startAutoSave() {
    this.saveInterval = setInterval(() => {
      if (this.pendingSave) {
        this.saveApiKeys();
      }
    }, 5000);
  }

  scheduleSave() {
    this.pendingSave = true;
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
    this.scheduleSave();
    return true;
  }

  async getWhatsAppClient(apiKey, sessionId = 'default') {
    if (!this.whatsappClients[apiKey]) {
      this.whatsappClients[apiKey] = {};
    }
    
    if (!this.whatsappClients[apiKey][sessionId]) {
      console.log(`Creating new WhatsApp client for API key: ${apiKey}, session: ${sessionId}`);
      this.whatsappClients[apiKey][sessionId] = new WhatsAppClient(apiKey, sessionId);
      await this.whatsappClients[apiKey][sessionId].initialize();
    }
    
    return this.whatsappClients[apiKey][sessionId];
  }

  listSessions(apiKey) {
    if (!this.whatsappClients[apiKey]) {
      return [];
    }
    return Object.keys(this.whatsappClients[apiKey]).map(sessionId => {
      const client = this.whatsappClients[apiKey][sessionId];
      return {
        sessionId,
        connected: client.isConnected,
        status: client.connectionStatus
      };
    });
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

  async deleteApiKey(apiKey) {
    if (this.apiKeys[apiKey]) {
      if (this.whatsappClients[apiKey]) {
        // Logout all sessions for this API key
        for (const sessionId in this.whatsappClients[apiKey]) {
          await this.whatsappClients[apiKey][sessionId].logout();
        }
        delete this.whatsappClients[apiKey];
      }
      
      const authPath = path.join(__dirname, 'baileys_auth_info', apiKey);
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }
      
      delete this.apiKeys[apiKey];
      this.saveApiKeys();
      return true;
    }
    return false;
  }

  async deleteSession(apiKey, sessionId) {
    if (this.whatsappClients[apiKey] && this.whatsappClients[apiKey][sessionId]) {
      await this.whatsappClients[apiKey][sessionId].logout();
      delete this.whatsappClients[apiKey][sessionId];
      
      const sessionPath = path.join(__dirname, 'baileys_auth_info', apiKey, sessionId);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }
      
      return true;
    }
    return false;
  }
}

module.exports = new ApiKeyManager();

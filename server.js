const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const apiKeyManager = require('./apiKeyManager');
const { requireApiKey, requireAdminKey } = require('./middleware');
const { upload, getFileCategory, uploadsDir } = require('./uploadConfig');

const app = express();
const PORT = process.env.PORT || 3004;

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/admin/apikeys/generate', requireAdminKey, (req, res) => {
  const { name } = req.body;
  
  // Generate random name if not provided
  let appName = name;
  if (!appName || appName.trim() === '') {
    const adjectives = ['Swift', 'Rapid', 'Smart', 'Quick', 'Bright', 'Bold', 'Prime', 'Elite', 'Ultra', 'Mega'];
    const nouns = ['App', 'Service', 'Bot', 'Gateway', 'Client', 'System', 'Platform', 'Hub', 'Portal', 'Agent'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    appName = `${randomAdjective} ${randomNoun} ${randomNumber}`;
  }
  
  const apiKey = apiKeyManager.generateApiKey(appName);
  res.json({
    success: true,
    apiKey,
    name: appName,
    message: 'API key generated successfully'
  });
});

app.get('/api/admin/apikeys', requireAdminKey, (req, res) => {
  const keys = apiKeyManager.listApiKeys();
  res.json({
    success: true,
    apiKeys: keys
  });
});

app.delete('/api/admin/apikeys/:key', requireAdminKey, async (req, res) => {
  const { key } = req.params;
  const deleted = await apiKeyManager.deleteApiKey(key);
  res.json({
    success: deleted,
    message: deleted ? 'API key deleted' : 'API key not found'
  });
});

app.post('/api/admin/apikeys/:key/revoke', requireAdminKey, (req, res) => {
  const { key } = req.params;
  const revoked = apiKeyManager.revokeApiKey(key);
  res.json({
    success: revoked,
    message: revoked ? 'API key revoked' : 'API key not found'
  });
});

app.get('/api/status', requireApiKey, (req, res) => {
  const status = req.whatsappClient.getStatus();
  res.json({
    success: true,
    sessionId: req.sessionId,
    ...status
  });
});

app.get('/api/qr', requireApiKey, (req, res) => {
  const status = req.whatsappClient.getStatus();
  
  if (status.qr) {
    res.json({
      success: true,
      qr: status.qr,
      status: status.status,
      sessionId: req.sessionId,
      message: 'QR code available. Scan with WhatsApp mobile app.'
    });
  } else if (status.connected) {
    res.json({
      success: false,
      message: 'Already connected. No QR code needed.',
      status: status.status,
      sessionId: req.sessionId
    });
  } else {
    res.json({
      success: false,
      message: 'QR code not available yet. Please wait or check connection status.',
      status: status.status,
      sessionId: req.sessionId
    });
  }
});

app.get('/api/sessions', requireApiKey, (req, res) => {
  const sessions = apiKeyManager.listSessions(req.apiKey);
  res.json({
    success: true,
    sessions
  });
});

app.delete('/api/sessions/:sessionId', requireApiKey, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = await apiKeyManager.deleteSession(req.apiKey, sessionId);
    res.json({
      success: deleted,
      message: deleted ? 'Session deleted successfully' : 'Session not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload endpoints
app.post('/api/upload', requireApiKey, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const fileCategory = getFileCategory(req.file.mimetype);

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: fileCategory,
        url: fileUrl,
        path: `/uploads/${req.file.filename}`
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload/send-image', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { number, caption } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const result = await req.whatsappClient.sendImage(number, fileUrl, caption || '');
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      },
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload/send-video', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { number, caption } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const result = await req.whatsappClient.sendVideo(number, fileUrl, caption || '');
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      },
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload/send-audio', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { number, ptt } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const result = await req.whatsappClient.sendAudio(number, fileUrl, ptt === 'true' || ptt === true);
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      },
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload/send-document', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { number, fileName } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const displayName = fileName || req.file.originalname;
    const result = await req.whatsappClient.sendDocument(number, fileUrl, displayName, req.file.mimetype);
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      },
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/upload/send-sticker', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { number } = req.body;
    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Number is required'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const result = await req.whatsappClient.sendSticker(number, fileUrl);
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        url: fileUrl
      },
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/send-message', requireApiKey, async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'Number and message are required'
      });
    }

    const result = await req.whatsappClient.sendMessage(number, message);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.code === 'WA_DISCONNECTED') {
      return res.status(503).json({
        success: false,
        error: error.message,
        code: 'WA_DISCONNECTED',
        connectionStatus: error.status,
        qr: error.qr,
        message: 'WhatsApp is disconnected. Please check /api/status for current status and QR code if needed.'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/send-image', requireApiKey, async (req, res) => {
  try {
    const { number, imageUrl, caption } = req.body;

    if (!number || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Number and imageUrl are required'
      });
    }

    const result = await req.whatsappClient.sendImage(number, imageUrl, caption);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/send-video', requireApiKey, async (req, res) => {
  try {
    const { number, videoUrl, caption } = req.body;
    if (!number || !videoUrl) {
      return res.status(400).json({ success: false, error: 'Number and videoUrl are required' });
    }
    const result = await req.whatsappClient.sendVideo(number, videoUrl, caption);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-audio', requireApiKey, async (req, res) => {
  try {
    const { number, audioUrl, ptt } = req.body;
    if (!number || !audioUrl) {
      return res.status(400).json({ success: false, error: 'Number and audioUrl are required' });
    }
    const result = await req.whatsappClient.sendAudio(number, audioUrl, ptt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-document', requireApiKey, async (req, res) => {
  try {
    const { number, documentUrl, fileName, mimetype } = req.body;
    if (!number || !documentUrl || !fileName) {
      return res.status(400).json({ success: false, error: 'Number, documentUrl, and fileName are required' });
    }
    const result = await req.whatsappClient.sendDocument(number, documentUrl, fileName, mimetype);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-sticker', requireApiKey, async (req, res) => {
  try {
    const { number, stickerUrl } = req.body;
    if (!number || !stickerUrl) {
      return res.status(400).json({ success: false, error: 'Number and stickerUrl are required' });
    }
    const result = await req.whatsappClient.sendSticker(number, stickerUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-location', requireApiKey, async (req, res) => {
  try {
    const { number, latitude, longitude, name, address } = req.body;
    if (!number || !latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Number, latitude, and longitude are required' });
    }
    const result = await req.whatsappClient.sendLocation(number, latitude, longitude, name, address);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-contact', requireApiKey, async (req, res) => {
  try {
    const { number, contactName, contactNumber } = req.body;
    if (!number || !contactName || !contactNumber) {
      return res.status(400).json({ success: false, error: 'Number, contactName, and contactNumber are required' });
    }
    const result = await req.whatsappClient.sendContact(number, contactName, contactNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-buttons', requireApiKey, async (req, res) => {
  try {
    const { number, text, buttons, footer, imageUrl } = req.body;
    if (!number || !text || !buttons) {
      return res.status(400).json({ success: false, error: 'Number, text, and buttons are required' });
    }
    const result = await req.whatsappClient.sendButtons(number, text, buttons, footer, imageUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-list', requireApiKey, async (req, res) => {
  try {
    const { number, text, buttonText, sections, footer, title } = req.body;
    if (!number || !text || !buttonText || !sections) {
      return res.status(400).json({ success: false, error: 'Number, text, buttonText, and sections are required' });
    }
    const result = await req.whatsappClient.sendList(number, text, buttonText, sections, footer, title);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-poll', requireApiKey, async (req, res) => {
  try {
    const { number, question, options } = req.body;
    if (!number || !question || !options) {
      return res.status(400).json({ success: false, error: 'Number, question, and options are required' });
    }
    const result = await req.whatsappClient.sendPoll(number, question, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reply-message', requireApiKey, async (req, res) => {
  try {
    const { number, messageId, text } = req.body;
    if (!number || !messageId || !text) {
      return res.status(400).json({ success: false, error: 'Number, messageId, and text are required' });
    }
    const result = await req.whatsappClient.replyMessage(number, messageId, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/forward-message', requireApiKey, async (req, res) => {
  try {
    const { toNumber, fromNumber, messageId } = req.body;
    if (!toNumber || !fromNumber || !messageId) {
      return res.status(400).json({ success: false, error: 'toNumber, fromNumber, and messageId are required' });
    }
    const result = await req.whatsappClient.forwardMessage(toNumber, fromNumber, messageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/delete-message', requireApiKey, async (req, res) => {
  try {
    const { number, messageId, forEveryone } = req.body;
    if (!number || !messageId) {
      return res.status(400).json({ success: false, error: 'Number and messageId are required' });
    }
    const result = await req.whatsappClient.deleteMessage(number, messageId, forEveryone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/react-message', requireApiKey, async (req, res) => {
  try {
    const { number, messageId, emoji } = req.body;
    if (!number || !messageId || !emoji) {
      return res.status(400).json({ success: false, error: 'Number, messageId, and emoji are required' });
    }
    const result = await req.whatsappClient.reactToMessage(number, messageId, emoji);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/create', requireApiKey, async (req, res) => {
  try {
    const { name, participants } = req.body;
    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'Name and participants array are required' });
    }
    const result = await req.whatsappClient.createGroup(name, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/add-participants', requireApiKey, async (req, res) => {
  try {
    const { groupJid, participants } = req.body;
    if (!groupJid || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'groupJid and participants array are required' });
    }
    const result = await req.whatsappClient.addParticipants(groupJid, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/remove-participants', requireApiKey, async (req, res) => {
  try {
    const { groupJid, participants } = req.body;
    if (!groupJid || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'groupJid and participants array are required' });
    }
    const result = await req.whatsappClient.removeParticipants(groupJid, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/promote', requireApiKey, async (req, res) => {
  try {
    const { groupJid, participants } = req.body;
    if (!groupJid || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'groupJid and participants array are required' });
    }
    const result = await req.whatsappClient.promoteParticipants(groupJid, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/demote', requireApiKey, async (req, res) => {
  try {
    const { groupJid, participants } = req.body;
    if (!groupJid || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ success: false, error: 'groupJid and participants array are required' });
    }
    const result = await req.whatsappClient.demoteParticipants(groupJid, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/group/info/:groupJid', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.params;
    const result = await req.whatsappClient.getGroupInfo(groupJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/update-subject', requireApiKey, async (req, res) => {
  try {
    const { groupJid, subject } = req.body;
    if (!groupJid || !subject) {
      return res.status(400).json({ success: false, error: 'groupJid and subject are required' });
    }
    const result = await req.whatsappClient.updateGroupSubject(groupJid, subject);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/update-description', requireApiKey, async (req, res) => {
  try {
    const { groupJid, description } = req.body;
    if (!groupJid || !description) {
      return res.status(400).json({ success: false, error: 'groupJid and description are required' });
    }
    const result = await req.whatsappClient.updateGroupDescription(groupJid, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/leave', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.body;
    if (!groupJid) {
      return res.status(400).json({ success: false, error: 'groupJid is required' });
    }
    const result = await req.whatsappClient.leaveGroup(groupJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/group/invite-link/:groupJid', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.params;
    const result = await req.whatsappClient.getGroupInviteLink(groupJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/revoke-invite', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.body;
    if (!groupJid) {
      return res.status(400).json({ success: false, error: 'groupJid is required' });
    }
    const result = await req.whatsappClient.revokeGroupInviteLink(groupJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/group/accept-invite', requireApiKey, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ success: false, error: 'inviteCode is required' });
    }
    const result = await req.whatsappClient.acceptGroupInvite(inviteCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/check-number/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await req.whatsappClient.checkNumberRegistered(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/profile-picture/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await req.whatsappClient.getProfilePicture(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/update-profile-picture', requireApiKey, async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ success: false, error: 'imagePath is required' });
    }
    const result = await req.whatsappClient.updateProfilePicture(imagePath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/update-profile-status', requireApiKey, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    const result = await req.whatsappClient.updateProfileStatus(status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/get-presence', requireApiKey, async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }
    const result = await req.whatsappClient.getPresence(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/set-presence', requireApiKey, async (req, res) => {
  try {
    const { type } = req.body;
    const result = await req.whatsappClient.setPresence(type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mark-as-read', requireApiKey, async (req, res) => {
  try {
    const { number, messageId } = req.body;
    if (!number || !messageId) {
      return res.status(400).json({ success: false, error: 'number and messageId are required' });
    }
    const result = await req.whatsappClient.markAsRead(number, messageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-typing', requireApiKey, async (req, res) => {
  try {
    const { number, isTyping } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }
    const result = await req.whatsappClient.sendTyping(number, isTyping);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-recording', requireApiKey, async (req, res) => {
  try {
    const { number, isRecording } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }
    const result = await req.whatsappClient.sendRecording(number, isRecording);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/block-user', requireApiKey, async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }
    const result = await req.whatsappClient.blockUser(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/unblock-user', requireApiKey, async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: 'number is required' });
    }
    const result = await req.whatsappClient.unblockUser(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/business-profile/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await req.whatsappClient.getBusinessProfile(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incoming-messages', requireApiKey, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const messages = req.whatsappClient.getIncomingMessages(limit);
  res.json({ success: true, messages });
});

app.post('/api/clear-messages', requireApiKey, (req, res) => {
  const result = req.whatsappClient.clearIncomingMessages();
  res.json(result);
});

app.post('/api/admin/logout/:apiKey', requireAdminKey, async (req, res) => {
  try {
    const { apiKey } = req.params;
    const { sessionId } = req.body;
    
    if (sessionId) {
      // Logout specific session
      const deleted = await apiKeyManager.deleteSession(apiKey, sessionId);
      res.json({
        success: deleted,
        message: deleted ? `Session '${sessionId}' logged out successfully` : 'Session not found'
      });
    } else {
      // Logout all sessions for this API key
      const sessions = apiKeyManager.listSessions(apiKey);
      for (const session of sessions) {
        await apiKeyManager.deleteSession(apiKey, session.sessionId);
      }
      res.json({
        success: true,
        message: `All sessions (${sessions.length}) logged out successfully`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('WhatsApp clients will be initialized per API key on first use');
});

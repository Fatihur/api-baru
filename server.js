const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const whatsappClient = require('./whatsappClient');
const apiKeyManager = require('./apiKeyManager');
const { requireApiKey, requireAdminKey } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/admin/apikeys/generate', requireAdminKey, (req, res) => {
  const { name } = req.body;
  const apiKey = apiKeyManager.generateApiKey(name || 'Unnamed App');
  res.json({
    success: true,
    apiKey,
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

app.delete('/api/admin/apikeys/:key', requireAdminKey, (req, res) => {
  const { key } = req.params;
  const deleted = apiKeyManager.deleteApiKey(key);
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
  const status = whatsappClient.getStatus();
  res.json({
    success: true,
    ...status
  });
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

    const result = await whatsappClient.sendMessage(number, message);
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

app.post('/api/send-image', requireApiKey, async (req, res) => {
  try {
    const { number, imageUrl, caption } = req.body;

    if (!number || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Number and imageUrl are required'
      });
    }

    const result = await whatsappClient.sendImage(number, imageUrl, caption);
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
    const result = await whatsappClient.sendVideo(number, videoUrl, caption);
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
    const result = await whatsappClient.sendAudio(number, audioUrl, ptt);
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
    const result = await whatsappClient.sendDocument(number, documentUrl, fileName, mimetype);
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
    const result = await whatsappClient.sendSticker(number, stickerUrl);
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
    const result = await whatsappClient.sendLocation(number, latitude, longitude, name, address);
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
    const result = await whatsappClient.sendContact(number, contactName, contactNumber);
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
    const result = await whatsappClient.sendButtons(number, text, buttons, footer, imageUrl);
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
    const result = await whatsappClient.sendList(number, text, buttonText, sections, footer, title);
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
    const result = await whatsappClient.sendPoll(number, question, options);
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
    const result = await whatsappClient.replyMessage(number, messageId, text);
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
    const result = await whatsappClient.forwardMessage(toNumber, fromNumber, messageId);
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
    const result = await whatsappClient.deleteMessage(number, messageId, forEveryone);
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
    const result = await whatsappClient.reactToMessage(number, messageId, emoji);
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
    const result = await whatsappClient.createGroup(name, participants);
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
    const result = await whatsappClient.addParticipants(groupJid, participants);
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
    const result = await whatsappClient.removeParticipants(groupJid, participants);
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
    const result = await whatsappClient.promoteParticipants(groupJid, participants);
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
    const result = await whatsappClient.demoteParticipants(groupJid, participants);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/group/info/:groupJid', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.params;
    const result = await whatsappClient.getGroupInfo(groupJid);
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
    const result = await whatsappClient.updateGroupSubject(groupJid, subject);
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
    const result = await whatsappClient.updateGroupDescription(groupJid, description);
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
    const result = await whatsappClient.leaveGroup(groupJid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/group/invite-link/:groupJid', requireApiKey, async (req, res) => {
  try {
    const { groupJid } = req.params;
    const result = await whatsappClient.getGroupInviteLink(groupJid);
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
    const result = await whatsappClient.revokeGroupInviteLink(groupJid);
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
    const result = await whatsappClient.acceptGroupInvite(inviteCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/check-number/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await whatsappClient.checkNumberRegistered(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/profile-picture/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await whatsappClient.getProfilePicture(number);
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
    const result = await whatsappClient.updateProfilePicture(imagePath);
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
    const result = await whatsappClient.updateProfileStatus(status);
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
    const result = await whatsappClient.getPresence(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/set-presence', requireApiKey, async (req, res) => {
  try {
    const { type } = req.body;
    const result = await whatsappClient.setPresence(type);
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
    const result = await whatsappClient.markAsRead(number, messageId);
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
    const result = await whatsappClient.sendTyping(number, isTyping);
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
    const result = await whatsappClient.sendRecording(number, isRecording);
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
    const result = await whatsappClient.blockUser(number);
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
    const result = await whatsappClient.unblockUser(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/business-profile/:number', requireApiKey, async (req, res) => {
  try {
    const { number } = req.params;
    const result = await whatsappClient.getBusinessProfile(number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incoming-messages', requireApiKey, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const messages = whatsappClient.getIncomingMessages(limit);
  res.json({ success: true, messages });
});

app.post('/api/clear-messages', requireApiKey, (req, res) => {
  const result = whatsappClient.clearIncomingMessages();
  res.json(result);
});

app.post('/api/admin/logout', requireAdminKey, async (req, res) => {
  try {
    await whatsappClient.logout();
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Initializing WhatsApp connection...');
  await whatsappClient.initialize();
});

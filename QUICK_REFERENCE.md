# Quick Reference Guide

## 🚀 WhatsApp Gateway API - Cheat Sheet

---

## Setup in 3 Steps

```bash
# 1. Install
npm install

# 2. Start server
npm start

# 3. Open browser
http://localhost:3000
```

**Admin Key**: `admin123` (default)

---

## Authentication

```javascript
headers: {
  'X-API-Key': 'your_api_key_here'
}
```

---

## 📤 Send Messages

### Text
```bash
POST /api/send-message
{number, message}
```

### Image
```bash
POST /api/send-image
{number, imageUrl, caption?}
```

### Video
```bash
POST /api/send-video
{number, videoUrl, caption?}
```

### Audio
```bash
POST /api/send-audio
{number, audioUrl, ptt?}
```

### Document
```bash
POST /api/send-document
{number, documentUrl, fileName, mimetype?}
```

### Location
```bash
POST /api/send-location
{number, latitude, longitude, name?, address?}
```

### Contact
```bash
POST /api/send-contact
{number, contactName, contactNumber}
```

---

## 🎮 Interactive

### Buttons
```bash
POST /api/send-buttons
{number, text, buttons: [{id, text}], footer?, imageUrl?}
```

### List
```bash
POST /api/send-list
{number, text, buttonText, sections, footer?, title?}
```

### Poll
```bash
POST /api/send-poll
{number, question, options: []}
```

---

## 💬 Message Control

```bash
POST /api/reply-message        {number, messageId, text}
POST /api/forward-message       {toNumber, fromNumber, messageId}
POST /api/delete-message        {number, messageId, forEveryone?}
POST /api/react-message         {number, messageId, emoji}
POST /api/mark-as-read          {number, messageId}
```

---

## 👥 Groups

```bash
POST /api/group/create                {name, participants: []}
POST /api/group/add-participants      {groupJid, participants: []}
POST /api/group/remove-participants   {groupJid, participants: []}
POST /api/group/promote               {groupJid, participants: []}
POST /api/group/demote                {groupJid, participants: []}
GET  /api/group/info/:groupJid
POST /api/group/update-subject        {groupJid, subject}
POST /api/group/update-description    {groupJid, description}
POST /api/group/leave                 {groupJid}
GET  /api/group/invite-link/:groupJid
POST /api/group/revoke-invite         {groupJid}
POST /api/group/accept-invite         {inviteCode}
```

---

## 👤 Profile & Contact

```bash
GET  /api/check-number/:number
GET  /api/profile-picture/:number
POST /api/update-profile-picture    {imagePath}
POST /api/update-profile-status     {status}
POST /api/block-user                {number}
POST /api/unblock-user              {number}
GET  /api/business-profile/:number
```

---

## 👁️ Presence

```bash
POST /api/get-presence      {number}
POST /api/set-presence      {type}  # available, unavailable
POST /api/send-typing       {number, isTyping}
POST /api/send-recording    {number, isRecording}
```

---

## 📥 Incoming

```bash
GET  /api/incoming-messages?limit=50
POST /api/clear-messages
```

---

## 🔑 Admin

```bash
POST   /api/admin/apikeys/generate   [Admin] {name}
GET    /api/admin/apikeys            [Admin]
DELETE /api/admin/apikeys/:key       [Admin]
POST   /api/admin/apikeys/:key/revoke [Admin]
POST   /api/admin/logout             [Admin]
GET    /api/status                   [API Key]
```

---

## 📱 Number Format

✅ Correct: `628123456789`  
❌ Wrong: `08123456789`  
❌ Wrong: `+628123456789`  

---

## Common Patterns

### Send + React
```javascript
// 1. Send message
const {messageId} = await sendMessage(number, text);
// 2. React to it
await reactToMessage(number, messageId, '👍');
```

### Typing + Send
```javascript
// 1. Show typing
await sendTyping(number, true);
// 2. Wait a bit
await sleep(2000);
// 3. Send message
await sendMessage(number, text);
// 4. Stop typing
await sendTyping(number, false);
```

### Create Group + Send
```javascript
// 1. Create group
const {groupJid} = await createGroup('Team', [participant1, participant2]);
// 2. Send message to group
await sendMessage(groupJid, 'Welcome everyone!');
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing fields) |
| 401 | No API key provided |
| 403 | Invalid/inactive API key |
| 500 | WhatsApp not connected or internal error |

---

## Example: Full Workflow

```javascript
const API_KEY = 'wa_abc123...';
const BASE_URL = 'http://localhost:3000';

// 1. Check if number exists
const exists = await checkNumber('628123456789');

if (exists) {
  // 2. Show typing
  await sendTyping('628123456789', true);
  
  // 3. Wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));
  
  // 4. Send message
  const {messageId} = await sendMessage('628123456789', 'Hello!');
  
  // 5. React to message
  await reactToMessage('628123456789', messageId, '✅');
  
  // 6. Stop typing
  await sendTyping('628123456789', false);
}
```

---

## File Structure

```
api-baru/
├── server.js                 # Main server (50+ endpoints)
├── whatsappClient.js         # Baileys integration (40+ methods)
├── apiKeyManager.js          # API key system
├── middleware.js             # Authentication
├── package.json             # Dependencies
├── README.md                # Overview
├── API_DOCUMENTATION.md     # Complete API docs
├── TUTORIAL.md              # Step-by-step guide
├── FEATURES.md              # Feature list
├── CHANGELOG.md             # Version history
├── QUICK_REFERENCE.md       # This file
├── public/
│   ├── index.html          # Web UI
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
└── baileys_auth_info/      # WhatsApp session (auto-created)
```

---

## Tips & Tricks

### 1. Test Endpoints Quickly
Use the web UI at `http://localhost:3000` - it has interactive testing for all endpoints!

### 2. Monitor Incoming Messages
```javascript
setInterval(async () => {
  const messages = await getIncomingMessages(10);
  console.log('New messages:', messages.length);
}, 5000);
```

### 3. Bulk Send (Simple)
```javascript
const numbers = ['6281...', '6282...', '6283...'];
for (const number of numbers) {
  await sendMessage(number, 'Broadcast message');
  await new Promise(r => setTimeout(r, 2000)); // 2s delay
}
```

### 4. Auto-Reply Bot
```javascript
setInterval(async () => {
  const messages = await getIncomingMessages(5);
  for (const msg of messages) {
    if (msg.message?.conversation?.includes('hi')) {
      await sendMessage(msg.from, 'Hello! How can I help?');
    }
  }
}, 10000);
```

---

## Resources

- 📖 Full Documentation: `API_DOCUMENTATION.md`
- 🎓 Tutorial: `TUTORIAL.md`
- ✨ Features: `FEATURES.md`
- 📝 Changes: `CHANGELOG.md`
- 🌐 Web UI: `http://localhost:3000`

---

## Need Help?

1. Check the web UI documentation
2. Read `API_DOCUMENTATION.md`
3. Try examples in `TUTORIAL.md`
4. Check terminal logs for errors

---

**Quick Stats**: 50+ Endpoints | 8 Message Types | 100% Baileys Coverage

# WhatsApp Gateway API - Complete Documentation

## 📋 Table of Contents

1. [Message Sending](#message-sending)
2. [Interactive Messages](#interactive-messages)
3. [Message Management](#message-management)
4. [Group Management](#group-management)
5. [Contact & Profile](#contact--profile)
6. [Presence & Status](#presence--status)
7. [Incoming Messages](#incoming-messages)

---

## Authentication

All endpoints require API key authentication via header:
```
X-API-Key: your_api_key_here
```

---

## Message Sending

### POST /api/send-message
Send text message
```json
{
  "number": "628123456789",
  "message": "Hello World"
}
```

### POST /api/send-image
Send image with caption
```json
{
  "number": "628123456789",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Check this out!"
}
```

### POST /api/send-video
Send video with caption
```json
{
  "number": "628123456789",
  "videoUrl": "https://example.com/video.mp4",
  "caption": "Watch this"
}
```

### POST /api/send-audio
Send audio or voice note
```json
{
  "number": "628123456789",
  "audioUrl": "https://example.com/audio.mp3",
  "ptt": true
}
```
*Note: `ptt: true` for voice note, `false` for audio file*

### POST /api/send-document
Send document (PDF, Excel, etc)
```json
{
  "number": "628123456789",
  "documentUrl": "https://example.com/document.pdf",
  "fileName": "report.pdf",
  "mimetype": "application/pdf"
}
```

### POST /api/send-sticker
Send sticker
```json
{
  "number": "628123456789",
  "stickerUrl": "https://example.com/sticker.webp"
}
```

### POST /api/send-location
Send location
```json
{
  "number": "628123456789",
  "latitude": "-6.2088",
  "longitude": "106.8456",
  "name": "Jakarta",
  "address": "Jakarta, Indonesia"
}
```

### POST /api/send-contact
Send contact card (vCard)
```json
{
  "number": "628123456789",
  "contactName": "John Doe",
  "contactNumber": "628111222333"
}
```

---

## Interactive Messages

### POST /api/send-buttons
Send message with buttons
```json
{
  "number": "628123456789",
  "text": "Choose an option:",
  "buttons": [
    {"id": "btn1", "text": "Option 1"},
    {"id": "btn2", "text": "Option 2"},
    {"id": "btn3", "text": "Option 3"}
  ],
  "footer": "Select one",
  "imageUrl": "https://example.com/image.jpg"
}
```

### POST /api/send-list
Send list message
```json
{
  "number": "628123456789",
  "text": "Select a product",
  "buttonText": "View Menu",
  "sections": [
    {
      "title": "Category 1",
      "rows": [
        {"title": "Product 1", "description": "Description 1", "rowId": "p1"},
        {"title": "Product 2", "description": "Description 2", "rowId": "p2"}
      ]
    }
  ],
  "footer": "Our Products",
  "title": "Product Menu"
}
```

### POST /api/send-poll
Create poll
```json
{
  "number": "628123456789",
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green", "Yellow"]
}
```

---

## Message Management

### POST /api/reply-message
Reply to a message
```json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "text": "Reply text"
}
```

### POST /api/forward-message
Forward message
```json
{
  "toNumber": "628111222333",
  "fromNumber": "628123456789",
  "messageId": "3EB0C91D2B1234567890"
}
```

### POST /api/delete-message
Delete message
```json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "forEveryone": true
}
```

### POST /api/react-message
React to message with emoji
```json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "emoji": "👍"
}
```

### POST /api/mark-as-read
Mark message as read
```json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890"
}
```

---

## Group Management

### POST /api/group/create
Create new group
```json
{
  "name": "My Group",
  "participants": ["628123456789", "628111222333"]
}
```

### POST /api/group/add-participants
Add members to group
```json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789", "628111222333"]
}
```

### POST /api/group/remove-participants
Remove members from group
```json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
```

### POST /api/group/promote
Promote members to admin
```json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
```

### POST /api/group/demote
Demote admins to member
```json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
```

### GET /api/group/info/:groupJid
Get group information
```
GET /api/group/info/120363...@g.us
```

### POST /api/group/update-subject
Update group name
```json
{
  "groupJid": "120363...@g.us",
  "subject": "New Group Name"
}
```

### POST /api/group/update-description
Update group description
```json
{
  "groupJid": "120363...@g.us",
  "description": "New description"
}
```

### POST /api/group/leave
Leave group
```json
{
  "groupJid": "120363...@g.us"
}
```

### GET /api/group/invite-link/:groupJid
Get group invite link
```
GET /api/group/invite-link/120363...@g.us
```

### POST /api/group/revoke-invite
Revoke and generate new invite link
```json
{
  "groupJid": "120363...@g.us"
}
```

### POST /api/group/accept-invite
Join group via invite code
```json
{
  "inviteCode": "ABC123XYZ"
}
```

---

## Contact & Profile

### GET /api/check-number/:number
Check if number is registered on WhatsApp
```
GET /api/check-number/628123456789
```

### GET /api/profile-picture/:number
Get profile picture URL
```
GET /api/profile-picture/628123456789
```

### POST /api/update-profile-picture
Update own profile picture
```json
{
  "imagePath": "/path/to/image.jpg"
}
```

### POST /api/update-profile-status
Update own status/about
```json
{
  "status": "Available"
}
```

### GET /api/business-profile/:number
Get business profile info
```
GET /api/business-profile/628123456789
```

### POST /api/block-user
Block a user
```json
{
  "number": "628123456789"
}
```

### POST /api/unblock-user
Unblock a user
```json
{
  "number": "628123456789"
}
```

---

## Presence & Status

### POST /api/get-presence
Subscribe to presence updates
```json
{
  "number": "628123456789"
}
```

### POST /api/set-presence
Set own presence status
```json
{
  "type": "available"
}
```
*Options: available, unavailable, composing, recording, paused*

### POST /api/send-typing
Show typing indicator
```json
{
  "number": "628123456789",
  "isTyping": true
}
```

### POST /api/send-recording
Show recording indicator
```json
{
  "number": "628123456789",
  "isRecording": true
}
```

---

## Incoming Messages

### GET /api/incoming-messages
Get recent incoming messages
```
GET /api/incoming-messages?limit=50
```

Response:
```json
{
  "success": true,
  "messages": [
    {
      "id": "3EB0C...",
      "from": "628123456789@s.whatsapp.net",
      "fromMe": false,
      "timestamp": 1234567890,
      "message": {...},
      "pushName": "John",
      "type": "conversation"
    }
  ]
}
```

### POST /api/clear-messages
Clear incoming messages history
```
POST /api/clear-messages
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "API key is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Invalid or inactive API key"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Required field missing"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "WhatsApp not connected"
}
```

---

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'your_api_key_here';

async function sendMessage(number, message) {
  try {
    const response = await axios.post(`${API_URL}/api/send-message`, {
      number,
      message
    }, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendMessage('628123456789', 'Hello from Node.js!');
```

### Python
```python
import requests

API_URL = 'http://localhost:3000'
API_KEY = 'your_api_key_here'

def send_message(number, message):
    response = requests.post(
        f'{API_URL}/api/send-message',
        json={'number': number, 'message': message},
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

result = send_message('628123456789', 'Hello from Python!')
print(result)
```

### PHP
```php
<?php
$apiUrl = 'http://localhost:3000';
$apiKey = 'your_api_key_here';

function sendMessage($number, $message) {
    global $apiUrl, $apiKey;
    
    $ch = curl_init("$apiUrl/api/send-message");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "X-API-Key: $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'number' => $number,
        'message' => $message
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response);
}

$result = sendMessage('628123456789', 'Hello from PHP!');
print_r($result);
?>
```

---

## Complete Feature List

✅ **50+ API Endpoints**:
- 📤 8 Media sending types (text, image, video, audio, document, sticker, location, contact)
- 🎮 3 Interactive messages (buttons, lists, polls)
- 💬 5 Message management (reply, forward, delete, react, read)
- 👥 12 Group features (create, add/remove, promote/demote, settings, invite links)
- 👤 7 Contact/Profile features (check, picture, status, business profile, block/unblock)
- 👁️ 4 Presence indicators (typing, recording, online status)
- 📥 Incoming message webhook/storage

---

## Rate Limiting & Best Practices

1. **Respect WhatsApp limits**: Don't spam messages
2. **Handle errors gracefully**: Check for connection status
3. **Store API keys securely**: Never expose in frontend code
4. **Use webhook for incoming**: Monitor `/api/incoming-messages` endpoint
5. **Format numbers correctly**: Use `628xxx` format, not `08xxx`

---

**Built with ❤️ using @whiskeysockets/baileys**

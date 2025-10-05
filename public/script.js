let adminKeyGlobal = '';

async function checkConnectionStatus() {
    try {
        const response = await fetch('/api/status', {
            headers: { 'X-API-Key': 'check' }
        });
        
        if (response.status === 401 || response.status === 403) {
            document.getElementById('statusText').textContent = 'API Ready';
            document.getElementById('statusIndicator').className = 'status-indicator';
            return;
        }

        const data = await response.json();
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');

        if (data.connected) {
            statusText.textContent = 'WhatsApp Connected';
            statusIndicator.className = 'status-indicator connected';
        } else if (data.status === 'qr_ready') {
            statusText.textContent = 'Scan QR Code to connect';
            statusIndicator.className = 'status-indicator';
        } else {
            statusText.textContent = `Status: ${data.status}`;
            statusIndicator.className = 'status-indicator disconnected';
        }
    } catch (error) {
        document.getElementById('statusText').textContent = 'Connection error';
        document.getElementById('statusIndicator').className = 'status-indicator disconnected';
    }
}

function loginAdmin() {
    const adminKey = document.getElementById('adminKey').value;
    if (!adminKey) {
        alert('Please enter admin key');
        return;
    }
    adminKeyGlobal = adminKey;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    loadApiKeys();
    checkStatus();
}

async function generateApiKey() {
    const appName = document.getElementById('appName').value || 'Unnamed App';
    const resultDiv = document.getElementById('newKeyResult');

    try {
        const response = await fetch('/api/admin/apikeys/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Key': adminKeyGlobal
            },
            body: JSON.stringify({ name: appName })
        });

        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="result success">
                    <strong>✅ API Key Generated!</strong><br><br>
                    <code style="background: #155724; color: white; padding: 10px; border-radius: 3px; display: block; margin-top: 10px; word-break: break-all;">
                        ${data.apiKey}
                    </code><br>
                    <small>⚠️ Save this key securely. It won't be shown again!</small>
                </div>
            `;
            document.getElementById('appName').value = '';
            setTimeout(() => loadApiKeys(), 500);
        } else {
            resultDiv.innerHTML = `<div class="result error">❌ ${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="result error">❌ Error: ${error.message}</div>`;
    }
}

async function loadApiKeys() {
    const listDiv = document.getElementById('apiKeysList');
    
    try {
        const response = await fetch('/api/admin/apikeys', {
            headers: { 'X-Admin-Key': adminKeyGlobal }
        });

        const data = await response.json();
        
        if (data.success && data.apiKeys.length > 0) {
            listDiv.innerHTML = data.apiKeys.map(key => `
                <div class="api-key-item ${!key.active ? 'inactive' : ''}">
                    <div class="api-key-info">
                        <strong>${key.key}</strong>
                        <div>
                            <span>📱 ${key.name}</span> | 
                            <span>📊 ${key.requestCount} requests</span> | 
                            <span>${key.active ? '✅ Active' : '❌ Inactive'}</span>
                        </div>
                        <small>Created: ${new Date(key.createdAt).toLocaleString()}</small>
                        ${key.lastUsed ? `<small> | Last used: ${new Date(key.lastUsed).toLocaleString()}</small>` : ''}
                    </div>
                    <div class="api-key-actions">
                        ${key.active ? `<button onclick="revokeKey('${key.key}')" class="btn btn-danger">Revoke</button>` : ''}
                        <button onclick="deleteKey('${key.key}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = '<p>No API keys found. Generate one to get started.</p>';
        }
    } catch (error) {
        listDiv.innerHTML = `<div class="result error">❌ Error loading keys: ${error.message}</div>`;
    }
}

async function revokeKey(key) {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
        const response = await fetch(`/api/admin/apikeys/${key}/revoke`, {
            method: 'POST',
            headers: { 'X-Admin-Key': adminKeyGlobal }
        });

        const data = await response.json();
        alert(data.message);
        loadApiKeys();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteKey(key) {
    if (!confirm('Are you sure you want to delete this API key permanently?')) return;

    try {
        const response = await fetch(`/api/admin/apikeys/${key}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': adminKeyGlobal }
        });

        const data = await response.json();
        alert(data.message);
        loadApiKeys();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function checkStatus() {
    const qrDiv = document.getElementById('qrCode');
    
    try {
        const response = await fetch('/api/admin/apikeys', {
            headers: { 'X-Admin-Key': adminKeyGlobal }
        });
        
        if (!response.ok) {
            qrDiv.innerHTML = '<div class="result error">❌ Please generate an API key first</div>';
            return;
        }
        
        const keysData = await response.json();
        if (!keysData.apiKeys || keysData.apiKeys.length === 0) {
            qrDiv.innerHTML = '<div class="result error">❌ Please generate an API key first</div>';
            return;
        }
        
        const firstKey = keysData.apiKeys[0].key;
        
        const statusResponse = await fetch('/api/status', {
            headers: { 'X-API-Key': firstKey }
        });

        const data = await statusResponse.json();
        
        if (data.qr) {
            qrDiv.innerHTML = `
                <div class="result">
                    <p><strong>📱 Scan QR Code dengan WhatsApp:</strong></p>
                    <img src="${data.qr}" alt="QR Code" style="max-width: 300px; border: 4px solid #667eea; border-radius: 10px; padding: 10px; background: white;">
                </div>
            `;
        } else if (data.connected) {
            qrDiv.innerHTML = '<div class="result success">✅ WhatsApp Connected!</div>';
        } else {
            qrDiv.innerHTML = `<div class="result">Status: ${data.status}</div>`;
        }
    } catch (error) {
        qrDiv.innerHTML = `<div class="result error">❌ Error: ${error.message}</div>`;
    }
}

async function logout() {
    if (!confirm('Logout dari WhatsApp? Anda harus scan QR code lagi.')) return;

    try {
        const response = await fetch('/api/admin/logout', {
            method: 'POST',
            headers: { 'X-Admin-Key': adminKeyGlobal }
        });

        const data = await response.json();
        alert(data.message);
        checkStatus();
        checkConnectionStatus();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function testSendMessage() {
    const apiKey = document.getElementById('testApiKey').value;
    const number = document.getElementById('testNumber').value;
    const message = document.getElementById('testMessage').value;
    const resultDiv = document.getElementById('result-send');

    if (!apiKey || !number || !message) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '❌ Please fill all fields';
        return;
    }

    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ number, message })
        });

        const data = await response.json();
        
        if (data.success) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `<strong>✅ Message Sent Successfully!</strong><br><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = '❌ ' + data.error;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '❌ Error: ' + error.message;
    }
}

async function testSendImage() {
    const apiKey = document.getElementById('imageApiKey').value;
    const number = document.getElementById('imageNumber').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const caption = document.getElementById('imageCaption').value;
    const resultDiv = document.getElementById('result-image');

    if (!apiKey || !number || !imageUrl) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '❌ Please fill required fields (API Key, Number, Image URL)';
        return;
    }

    try {
        const response = await fetch('/api/send-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ number, imageUrl, caption })
        });

        const data = await response.json();
        
        if (data.success) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `<strong>✅ Image Sent Successfully!</strong><br><pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            resultDiv.className = 'result error';
            resultDiv.textContent = '❌ ' + data.error;
        }
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.textContent = '❌ Error: ' + error.message;
    }
}

function copyCode(button) {
  const codeBlock = button.previousElementSibling;
  const code = codeBlock.textContent;
  
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy code');
  });
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById('tab-' + tabName).classList.add('active');
  event.target.classList.add('active');
}

function showLang(langName) {
  document.querySelectorAll('.lang-content').forEach(content => {
    content.classList.remove('active');
  });
  
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById('lang-' + langName).classList.add('active');
  event.target.classList.add('active');
}

function copyAllDocumentation(event) {
  const markdown = `# WhatsApp Gateway API - Complete Documentation

**Base URL:** \`http://localhost:3000\`

**Authentication:** All endpoints require API key via header or query parameter:
\`\`\`
X-API-Key: your_api_key_here
# OR
?apikey=your_api_key_here
\`\`\`

---

## 📤 Message Sending (8 Types)

### 1. Send Text Message
**Endpoint:** \`POST /api/send-message\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "message": "Hello World!"
}
\`\`\`

**Example (JavaScript):**
\`\`\`javascript
fetch('http://localhost:3000/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    number: '628123456789',
    message: 'Hello World!'
  })
}).then(res => res.json()).then(console.log);
\`\`\`

---

### 2. Send Image
**Endpoint:** \`POST /api/send-image\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "imageUrl": "https://picsum.photos/400",
  "caption": "Check this image!"
}
\`\`\`

---

### 3. Send Video
**Endpoint:** \`POST /api/send-video\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "videoUrl": "https://example.com/video.mp4",
  "caption": "Watch this video"
}
\`\`\`

---

### 4. Send Audio/Voice Note
**Endpoint:** \`POST /api/send-audio\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "audioUrl": "https://example.com/audio.mp3",
  "ptt": true
}
\`\`\`
*Note: Set "ptt": true for voice note, false for audio file*

---

### 5. Send Document
**Endpoint:** \`POST /api/send-document\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "documentUrl": "https://example.com/invoice.pdf",
  "fileName": "Invoice_2024.pdf",
  "mimetype": "application/pdf"
}
\`\`\`

---

### 6. Send Sticker
**Endpoint:** \`POST /api/send-sticker\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "stickerUrl": "https://example.com/sticker.webp"
}
\`\`\`

---

### 7. Send Location
**Endpoint:** \`POST /api/send-location\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "latitude": "-6.2088",
  "longitude": "106.8456",
  "name": "Monas",
  "address": "Jakarta, Indonesia"
}
\`\`\`

---

### 8. Send Contact
**Endpoint:** \`POST /api/send-contact\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "contactName": "John Doe",
  "contactNumber": "628111222333"
}
\`\`\`

---

## 🎮 Interactive Messages

### 1. Button Messages
**Endpoint:** \`POST /api/send-buttons\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "text": "Choose an option:",
  "buttons": [
    {"id": "btn1", "text": "Order Now"},
    {"id": "btn2", "text": "Get Info"},
    {"id": "btn3", "text": "Contact Us"}
  ],
  "footer": "Powered by API",
  "imageUrl": "https://example.com/logo.jpg"
}
\`\`\`

---

### 2. List Messages
**Endpoint:** \`POST /api/send-list\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "text": "Our Menu",
  "buttonText": "View Products",
  "sections": [
    {
      "title": "Food",
      "rows": [
        {"title": "Nasi Goreng", "description": "Rp 20.000", "rowId": "p1"},
        {"title": "Mie Goreng", "description": "Rp 18.000", "rowId": "p2"}
      ]
    },
    {
      "title": "Drinks",
      "rows": [
        {"title": "Es Teh", "description": "Rp 5.000", "rowId": "p3"},
        {"title": "Es Jeruk", "description": "Rp 7.000", "rowId": "p4"}
      ]
    }
  ],
  "footer": "Best prices",
  "title": "Menu List"
}
\`\`\`

---

### 3. Poll Messages
**Endpoint:** \`POST /api/send-poll\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green", "Yellow"]
}
\`\`\`

---

## 💬 Message Management

### 1. Reply to Message
**Endpoint:** \`POST /api/reply-message\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "text": "This is a reply"
}
\`\`\`

---

### 2. Forward Message
**Endpoint:** \`POST /api/forward-message\`

**Request:**
\`\`\`json
{
  "toNumber": "628111222333",
  "fromNumber": "628123456789",
  "messageId": "3EB0C91D2B1234567890"
}
\`\`\`

---

### 3. Delete Message
**Endpoint:** \`POST /api/delete-message\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "forEveryone": true
}
\`\`\`
*Note: Set "forEveryone": true to delete for all, false for yourself only*

---

### 4. React to Message
**Endpoint:** \`POST /api/react-message\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890",
  "emoji": "👍"
}
\`\`\`

---

### 5. Mark as Read
**Endpoint:** \`POST /api/mark-as-read\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "messageId": "3EB0C91D2B1234567890"
}
\`\`\`

---

## 👥 Group Management

### 1. Create Group
**Endpoint:** \`POST /api/group/create\`

**Request:**
\`\`\`json
{
  "name": "Project Team",
  "participants": ["628123456789", "628111222333", "628999888777"]
}
\`\`\`

---

### 2. Add Participants
**Endpoint:** \`POST /api/group/add-participants\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789", "628111222333"]
}
\`\`\`

---

### 3. Remove Participants
**Endpoint:** \`POST /api/group/remove-participants\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
\`\`\`

---

### 4. Promote to Admin
**Endpoint:** \`POST /api/group/promote\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
\`\`\`

---

### 5. Demote Admin
**Endpoint:** \`POST /api/group/demote\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "participants": ["628123456789"]
}
\`\`\`

---

### 6. Get Group Info
**Endpoint:** \`GET /api/group/info/:groupJid\`

**Request:**
\`\`\`
GET http://localhost:3000/api/group/info/120363...@g.us
X-API-Key: your_api_key
\`\`\`

---

### 7. Update Group Name
**Endpoint:** \`POST /api/group/update-subject\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "subject": "New Group Name"
}
\`\`\`

---

### 8. Update Group Description
**Endpoint:** \`POST /api/group/update-description\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us",
  "description": "New description"
}
\`\`\`

---

### 9. Leave Group
**Endpoint:** \`POST /api/group/leave\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us"
}
\`\`\`

---

### 10. Get Invite Link
**Endpoint:** \`GET /api/group/invite-link/:groupJid\`

**Request:**
\`\`\`
GET http://localhost:3000/api/group/invite-link/120363...@g.us
X-API-Key: your_api_key
\`\`\`

---

### 11. Revoke Invite Link
**Endpoint:** \`POST /api/group/revoke-invite\`

**Request:**
\`\`\`json
{
  "groupJid": "120363...@g.us"
}
\`\`\`

---

### 12. Accept Group Invite
**Endpoint:** \`POST /api/group/accept-invite\`

**Request:**
\`\`\`json
{
  "inviteCode": "ABC123XYZ"
}
\`\`\`

---

## 👤 Contact & Profile

### 1. Check Number Registered
**Endpoint:** \`GET /api/check-number/:number\`

**Request:**
\`\`\`
GET http://localhost:3000/api/check-number/628123456789
X-API-Key: your_api_key
\`\`\`

---

### 2. Get Profile Picture
**Endpoint:** \`GET /api/profile-picture/:number\`

**Request:**
\`\`\`
GET http://localhost:3000/api/profile-picture/628123456789
X-API-Key: your_api_key
\`\`\`

---

### 3. Update Profile Picture
**Endpoint:** \`POST /api/update-profile-picture\`

**Request:**
\`\`\`json
{
  "imagePath": "/path/to/image.jpg"
}
\`\`\`

---

### 4. Update Profile Status
**Endpoint:** \`POST /api/update-profile-status\`

**Request:**
\`\`\`json
{
  "status": "Available for work"
}
\`\`\`

---

### 5. Block User
**Endpoint:** \`POST /api/block-user\`

**Request:**
\`\`\`json
{
  "number": "628123456789"
}
\`\`\`

---

### 6. Unblock User
**Endpoint:** \`POST /api/unblock-user\`

**Request:**
\`\`\`json
{
  "number": "628123456789"
}
\`\`\`

---

### 7. Get Business Profile
**Endpoint:** \`GET /api/business-profile/:number\`

**Request:**
\`\`\`
GET http://localhost:3000/api/business-profile/628123456789
X-API-Key: your_api_key
\`\`\`

---

## 👁️ Presence & Indicators

### 1. Send Typing Indicator
**Endpoint:** \`POST /api/send-typing\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "isTyping": true
}
\`\`\`
*Note: Set "isTyping": false to stop typing indicator*

---

### 2. Send Recording Indicator
**Endpoint:** \`POST /api/send-recording\`

**Request:**
\`\`\`json
{
  "number": "628123456789",
  "isRecording": true
}
\`\`\`

---

### 3. Get Presence
**Endpoint:** \`POST /api/get-presence\`

**Request:**
\`\`\`json
{
  "number": "628123456789"
}
\`\`\`

---

### 4. Set Presence
**Endpoint:** \`POST /api/set-presence\`

**Request:**
\`\`\`json
{
  "type": "available"
}
\`\`\`
*Options: available, unavailable, composing, recording, paused*

---

## 📥 Incoming Messages

### 1. Get Incoming Messages
**Endpoint:** \`GET /api/incoming-messages\`

**Request:**
\`\`\`
GET http://localhost:3000/api/incoming-messages?limit=50
X-API-Key: your_api_key
\`\`\`

**Example (JavaScript):**
\`\`\`javascript
fetch('http://localhost:3000/api/incoming-messages?limit=10', {
  headers: { 'X-API-Key': 'your_api_key' }
})
.then(res => res.json())
.then(data => {
  data.messages.forEach(msg => {
    console.log('From:', msg.from);
    console.log('Message:', msg.message);
  });
});
\`\`\`

---

### 2. Clear Message History
**Endpoint:** \`POST /api/clear-messages\`

**Request:**
\`\`\`
POST http://localhost:3000/api/clear-messages
X-API-Key: your_api_key
\`\`\`

---

## 🔧 Complete Language Examples

### JavaScript / Node.js
\`\`\`javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'your_api_key_here';

async function sendMessage(number, message) {
  try {
    const response = await axios.post(\`\${API_URL}/api/send-message\`, {
      number,
      message
    }, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
sendMessage('628123456789', 'Hello from Node.js!');
\`\`\`

---

### Python
\`\`\`python
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

# Usage
result = send_message('628123456789', 'Hello from Python!')
print(result)
\`\`\`

---

### PHP
\`\`\`php
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

// Usage
$result = sendMessage('628123456789', 'Hello from PHP!');
print_r($result);
?>
\`\`\`

---

### cURL
\`\`\`bash
curl -X POST http://localhost:3000/api/send-message \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "number": "628123456789",
    "message": "Hello from cURL!"
  }'
\`\`\`

---

## ❌ Error Responses

### 401 Unauthorized
\`\`\`json
{
  "success": false,
  "error": "API key is required. Provide it in X-API-Key header or apikey query parameter"
}
\`\`\`

### 403 Forbidden
\`\`\`json
{
  "success": false,
  "error": "Invalid or inactive API key"
}
\`\`\`

### 400 Bad Request
\`\`\`json
{
  "success": false,
  "error": "Number and message are required"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "success": false,
  "error": "WhatsApp not connected"
}
\`\`\`

---

## 📊 Summary

- **Total Endpoints:** 50+
- **Message Types:** 8 (text, image, video, audio, document, sticker, location, contact)
- **Interactive Messages:** 3 (buttons, lists, polls)
- **Message Management:** 5 features
- **Group Features:** 12 complete features
- **Profile Features:** 7 features
- **Presence Features:** 4 features
- **Incoming Messages:** 2 features

---

**Built with ❤️ using @whiskeysockets/baileys**
**100% Baileys Coverage | Ready for Production**
`;

  navigator.clipboard.writeText(markdown).then(() => {
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✅ Copied to Clipboard!';
    btn.style.background = '#4caf50';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy documentation. Please try again.');
  });
}

setInterval(checkConnectionStatus, 5000);
checkConnectionStatus();

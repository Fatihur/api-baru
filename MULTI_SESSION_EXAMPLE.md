# Multi-Session Example

## Konsep

**1 API Key = Multiple WhatsApp Sessions**

Dengan satu API key, Anda bisa mengelola beberapa nomor WhatsApp sekaligus. Setiap session adalah koneksi WhatsApp yang independen.

## Use Case

```
API Key: wa_abc123

├── Session "sales"     → WhatsApp Sales Team (081234567890)
├── Session "support"   → WhatsApp Support Team (081234567891)
└── Session "marketing" → WhatsApp Marketing Team (081234567892)
```

## Step-by-Step Tutorial

### 1. Generate API Key

```bash
POST /api/admin/apikeys/generate
Headers: X-Admin-Key: admin123
Body: {
  "name": "My Company"
}

Response: {
  "apiKey": "wa_abc123..."
}
```

### 2. Setup Session 1: Sales

#### Get QR Code
```bash
GET /api/qr?sessionId=sales
Headers: X-API-Key: wa_abc123

Response: {
  "success": true,
  "qr": "data:image/png;base64,...",
  "sessionId": "sales",
  "status": "qr_ready"
}
```

#### Scan QR dengan WhatsApp Sales
Buka WhatsApp di HP Sales team, scan QR code di atas.

#### Check Status
```bash
GET /api/status?sessionId=sales
Headers: X-API-Key: wa_abc123

Response: {
  "success": true,
  "sessionId": "sales",
  "connected": true,
  "status": "connected"
}
```

### 3. Setup Session 2: Support

#### Get QR Code
```bash
GET /api/qr?sessionId=support
Headers: X-API-Key: wa_abc123

Response: {
  "success": true,
  "qr": "data:image/png;base64,...",
  "sessionId": "support",
  "status": "qr_ready"
}
```

#### Scan QR dengan WhatsApp Support
Buka WhatsApp di HP Support team, scan QR code.

### 4. List All Sessions

```bash
GET /api/sessions
Headers: X-API-Key: wa_abc123

Response: {
  "success": true,
  "sessions": [
    {
      "sessionId": "sales",
      "connected": true,
      "status": "connected"
    },
    {
      "sessionId": "support",
      "connected": true,
      "status": "connected"
    }
  ]
}
```

### 5. Send Message dari Session Berbeda

#### Dari Sales
```bash
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "sessionId": "sales",
  "number": "628123456789",
  "message": "Hi, this is Sales team. How can we help?"
}
```

#### Dari Support
```bash
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "sessionId": "support",
  "number": "628123456789",
  "message": "Hi, this is Support team. Do you need assistance?"
}
```

### 6. Delete Session

```bash
DELETE /api/sessions/sales
Headers: X-API-Key: wa_abc123

Response: {
  "success": true,
  "message": "Session deleted successfully"
}
```

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_KEY = 'wa_abc123';

// Send from Sales session
async function sendFromSales(number, message) {
  const response = await axios.post(`${API_URL}/api/send-message`, {
    sessionId: 'sales',
    number,
    message
  }, {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.data;
}

// Send from Support session
async function sendFromSupport(number, message) {
  const response = await axios.post(`${API_URL}/api/send-message`, {
    sessionId: 'support',
    number,
    message
  }, {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.data;
}

// List all sessions
async function listSessions() {
  const response = await axios.get(`${API_URL}/api/sessions`, {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.data.sessions;
}

// Example usage
(async () => {
  await sendFromSales('628123456789', 'Hello from Sales!');
  await sendFromSupport('628123456789', 'Hello from Support!');
  
  const sessions = await listSessions();
  console.log('Active sessions:', sessions);
})();
```

### Python

```python
import requests

API_URL = 'http://localhost:3000'
API_KEY = 'wa_abc123'

def send_from_sales(number, message):
    response = requests.post(
        f'{API_URL}/api/send-message',
        json={
            'sessionId': 'sales',
            'number': number,
            'message': message
        },
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

def send_from_support(number, message):
    response = requests.post(
        f'{API_URL}/api/send-message',
        json={
            'sessionId': 'support',
            'number': number,
            'message': message
        },
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

def list_sessions():
    response = requests.get(
        f'{API_URL}/api/sessions',
        headers={'X-API-Key': API_KEY}
    )
    return response.json()['sessions']

# Example usage
send_from_sales('628123456789', 'Hello from Sales!')
send_from_support('628123456789', 'Hello from Support!')

sessions = list_sessions()
print('Active sessions:', sessions)
```

### PHP

```php
<?php
$apiUrl = 'http://localhost:3000';
$apiKey = 'wa_abc123';

function sendFromSales($number, $message) {
    global $apiUrl, $apiKey;
    
    $ch = curl_init("$apiUrl/api/send-message");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "X-API-Key: $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'sessionId' => 'sales',
        'number' => $number,
        'message' => $message
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response);
}

function listSessions() {
    global $apiUrl, $apiKey;
    
    $ch = curl_init("$apiUrl/api/sessions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-API-Key: $apiKey"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response)->sessions;
}

// Example usage
sendFromSales('628123456789', 'Hello from Sales!');
$sessions = listSessions();
print_r($sessions);
?>
```

## sessionId Methods

You can pass `sessionId` in 3 ways:

### 1. Body Parameter (Recommended)
```json
{
  "sessionId": "sales",
  "number": "628123456789",
  "message": "Hello"
}
```

### 2. Query Parameter
```
GET /api/qr?sessionId=sales
```

### 3. Header
```
X-Session-Id: sales
```

## Default Session

Jika `sessionId` tidak disertakan, akan menggunakan session `"default"`:

```bash
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "number": "628123456789",
  "message": "Hello"
}
# Ini sama dengan sessionId: "default"
```

## Best Practices

1. **Naming Convention**: Gunakan nama yang deskriptif
   - ✅ `sales`, `support`, `marketing`
   - ❌ `session1`, `wa1`, `test`

2. **Session Management**: Monitor status secara berkala
   ```javascript
   setInterval(async () => {
     const sessions = await listSessions();
     sessions.forEach(s => {
       if (!s.connected) {
         console.log(`⚠️ Session ${s.sessionId} disconnected!`);
       }
     });
   }, 60000); // Every minute
   ```

3. **Error Handling**: Selalu handle error per session
   ```javascript
   try {
     await sendFromSales(number, message);
   } catch (error) {
     if (error.code === 'WA_DISCONNECTED') {
       console.log('Sales session disconnected, need re-authentication');
     }
   }
   ```

4. **Clean Up**: Hapus session yang tidak digunakan
   ```bash
   DELETE /api/sessions/old-session
   ```

## FAQ

**Q: Berapa maksimal session per API key?**
A: Tidak ada batasan! Anda bisa membuat sebanyak yang Anda butuhkan.

**Q: Apakah session bisa share incoming messages?**
A: Tidak. Setiap session memiliki incoming messages terpisah.

**Q: Bagaimana cara backup session?**
A: Backup folder `baileys_auth_info/{apiKey}/{sessionId}/`

**Q: Apakah bisa rename session?**
A: Tidak langsung. Cara: buat session baru → pindahkan konten folder auth → hapus session lama.

**Q: Session timeout?**
A: Session akan tetap aktif selama HP WhatsApp online dan terhubung internet.

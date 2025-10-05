# WhatsApp API Consumer Guide

## Menangani Logout / Disconnection

### 1. Cek Status Koneksi Sebelum Kirim
Selalu cek status koneksi sebelum mengirim pesan:

```javascript
// Cek status terlebih dahulu
const statusResponse = await fetch('http://localhost:3004/api/status', {
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});

const status = await statusResponse.json();

if (!status.connected) {
  console.log('WhatsApp disconnected. Status:', status.status);
  
  if (status.status === 'qr_ready') {
    // QR code tersedia, admin perlu scan
    console.log('QR Code:', status.qr);
    // Tampilkan QR atau notifikasi admin
  } else if (status.status === 'logged_out') {
    // Perlu login ulang
    console.log('WhatsApp logged out. Admin perlu scan QR baru.');
  } else if (status.status === 'reconnecting') {
    // Sedang mencoba reconnect
    console.log('WhatsApp sedang reconnecting...');
  }
  
  return; // Jangan kirim pesan
}
```

### 2. Implementasi Retry Logic dengan Exponential Backoff

```javascript
async function sendMessageWithRetry(number, message, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('http://localhost:3004/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'YOUR_API_KEY'
        },
        body: JSON.stringify({ number, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data; // Berhasil
      }

      // Jika disconnected (503)
      if (response.status === 503 && data.code === 'WA_DISCONNECTED') {
        console.log(`WhatsApp disconnected. Status: ${data.connectionStatus}`);
        
        // Tunggu lebih lama untuk reconnection
        const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
        console.log(`Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        continue; // Retry
      }

      // Error lain, throw
      throw new Error(data.error || 'Unknown error');

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const waitTime = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Usage
try {
  const result = await sendMessageWithRetry('628123456789', 'Hello!');
  console.log('Message sent:', result.messageId);
} catch (error) {
  console.error('Failed to send message:', error.message);
  // Simpan ke queue atau database untuk dikirim nanti
}
```

### 3. Monitor Status Secara Berkala

```javascript
// Polling status setiap 30 detik
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:3004/api/status', {
      headers: { 'X-API-Key': 'YOUR_API_KEY' }
    });
    
    const status = await response.json();
    
    if (!status.connected && status.status === 'qr_ready') {
      // Kirim notifikasi ke admin untuk scan QR
      sendAdminNotification('WhatsApp perlu di-scan QR', status.qr);
    }
    
    if (status.status === 'failed') {
      // Max reconnect attempts reached
      sendAdminNotification('WhatsApp gagal reconnect. Perlu restart server.');
    }

  } catch (error) {
    console.error('Failed to check status:', error);
  }
}, 30000);
```

### 4. Implementasi Message Queue

Untuk aplikasi production, gunakan message queue:

```javascript
// Simpan pesan yang gagal ke queue/database
class MessageQueue {
  constructor() {
    this.queue = [];
  }

  async add(number, message) {
    this.queue.push({
      id: Date.now(),
      number,
      message,
      attempts: 0,
      createdAt: new Date()
    });
    // Simpan ke database
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const msg = this.queue[0];

      try {
        // Cek status dulu
        const status = await checkStatus();
        if (!status.connected) {
          console.log('WhatsApp not connected. Waiting...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue;
        }

        // Kirim pesan
        await sendMessageWithRetry(msg.number, msg.message);
        
        // Hapus dari queue jika berhasil
        this.queue.shift();
        
      } catch (error) {
        msg.attempts++;
        
        if (msg.attempts >= 5) {
          // Gagal 5x, pindahkan ke dead letter queue
          console.error('Message failed permanently:', msg);
          this.queue.shift();
        } else {
          // Retry nanti
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }
  }
}
```

### 5. HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|---------|--------|
| `200` | Success | Pesan terkirim |
| `400` | Bad Request | Cek parameter request |
| `401` | Unauthorized | API key salah/hilang |
| `403` | Forbidden | API key invalid/revoked |
| `503` | Service Unavailable | WhatsApp disconnected, retry nanti |
| `500` | Internal Error | Error lain, cek error message |

### 6. Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `WA_DISCONNECTED` | WhatsApp tidak terkoneksi | Cek `/api/status` dan retry |

### 7. Best Practices

1. **Selalu cek `/api/status` sebelum kirim batch messages**
2. **Implement retry logic** dengan exponential backoff
3. **Gunakan message queue** untuk reliability
4. **Monitor status** secara berkala (polling atau webhook)
5. **Handle timeout** - set timeout 30-60 detik untuk API calls
6. **Log semua error** untuk debugging
7. **Notifikasi admin** jika status = `qr_ready`, `logged_out`, atau `failed`

### 8. Response Format saat Disconnected (503)

```json
{
  "success": false,
  "error": "WhatsApp not connected",
  "code": "WA_DISCONNECTED",
  "connectionStatus": "logged_out",
  "qr": "data:image/png;base64,...",
  "message": "WhatsApp is disconnected. Please check /api/status for current status and QR code if needed."
}
```

### 9. Recommended Architecture

```
Your App → Check Status → Queue Message → Retry Worker → WhatsApp API
                ↓
              Monitor (every 30s)
                ↓
           Alert Admin if needed
```

### 10. Example: Complete Implementation

```javascript
class WhatsAppAPIClient {
  constructor(apiKey, baseUrl = 'http://localhost:3004') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.isConnected = false;
    this.startMonitoring();
  }

  async checkStatus() {
    const response = await fetch(`${this.baseUrl}/api/status`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    const data = await response.json();
    this.isConnected = data.connected;
    return data;
  }

  startMonitoring() {
    setInterval(() => this.checkStatus(), 30000);
  }

  async sendMessage(number, message, retries = 3) {
    // Check status first
    const status = await this.checkStatus();
    if (!status.connected) {
      throw new Error(`WhatsApp not connected: ${status.status}`);
    }

    // Send with retry
    return this.sendWithRetry(number, message, retries);
  }

  async sendWithRetry(number, message, retries) {
    // Implementation dari contoh di atas
  }
}

// Usage
const client = new WhatsAppAPIClient('YOUR_API_KEY');
await client.sendMessage('628123456789', 'Hello!');
```

## Kesimpulan

Sebagai consumer API:
1. **Jangan assume API selalu connected**
2. **Implement proper error handling**
3. **Use retry logic with backoff**
4. **Monitor status regularly**
5. **Queue messages for reliability**
6. **Alert admin when action needed**

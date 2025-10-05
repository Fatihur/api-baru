# Tutorial Lengkap WhatsApp Gateway API - Complete Edition

**🚀 50+ Fitur WhatsApp dalam Satu API!**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server
```bash
npm start
```

### 3. Buka Browser
Buka `http://localhost:3000` di browser

---

## 📋 Langkah-langkah Setup

### Step 1: Generate API Key
1. Buka halaman web `http://localhost:3000`
2. Scroll ke bagian "Admin Panel"
3. Login dengan admin key: `admin123` (default)
4. Masukkan nama aplikasi (contoh: "Mobile App Production")
5. Klik "Generate API Key"
6. **PENTING**: Salin dan simpan API key yang dihasilkan!

### Step 2: Koneksi WhatsApp
1. Setelah login admin, klik "Check Status / Get QR"
2. Scan QR code yang muncul dengan WhatsApp di HP Anda:
   - Buka WhatsApp di HP
   - Tap menu (3 titik) > Linked Devices
   - Tap "Link a Device"
   - Scan QR code yang muncul di browser
3. Tunggu hingga status berubah menjadi "Connected"

### Step 3: Test API
1. Scroll ke bagian "Test Your API"
2. Masukkan API key yang sudah digenerate
3. Masukkan nomor WhatsApp tujuan (format: 628123456789)
4. Ketik pesan yang ingin dikirim
5. Klik "Send Test Message"
6. Cek WhatsApp untuk melihat pesan terkirim

---

## 🔧 Cara Menggunakan di Aplikasi

### Option 1: Query Parameter
```javascript
fetch('http://localhost:3000/api/send-message?apikey=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '628123456789',
    message: 'Hello from my app!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Option 2: Header (Recommended)
```javascript
fetch('http://localhost:3000/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    message: 'Hello from my app!'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📱 Contoh Integrasi - Fitur Dasar

### JavaScript - Kirim Text
```javascript
fetch('http://localhost:3000/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    message: 'Hello World!'
  })
});
```

### JavaScript - Kirim Gambar
```javascript
fetch('http://localhost:3000/api/send-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    imageUrl: 'https://picsum.photos/400',
    caption: 'Random image'
  })
});
```

### JavaScript - Kirim Video
```javascript
fetch('http://localhost:3000/api/send-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    videoUrl: 'https://example.com/video.mp4',
    caption: 'Check this video'
  })
});
```

### JavaScript - Kirim Document
```javascript
fetch('http://localhost:3000/api/send-document', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    documentUrl: 'https://example.com/document.pdf',
    fileName: 'invoice.pdf',
    mimetype: 'application/pdf'
  })
});
```

### JavaScript - Kirim Location
```javascript
fetch('http://localhost:3000/api/send-location', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    latitude: '-6.2088',
    longitude: '106.8456',
    name: 'Monas',
    address: 'Jakarta, Indonesia'
  })
});
```

---

## 🎮 Interactive Messages

### Kirim Button Message
```javascript
fetch('http://localhost:3000/api/send-buttons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    text: 'Pilih menu:',
    buttons: [
      {id: 'btn1', text: 'Order'},
      {id: 'btn2', text: 'Info'},
      {id: 'btn3', text: 'Support'}
    ],
    footer: 'Powered by API',
    imageUrl: 'https://example.com/logo.jpg'
  })
});
```

### Kirim List Message
```javascript
fetch('http://localhost:3000/api/send-list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    text: 'Pilih produk:',
    buttonText: 'Lihat Menu',
    sections: [
      {
        title: 'Makanan',
        rows: [
          {title: 'Nasi Goreng', description: 'Rp 20.000', rowId: 'p1'},
          {title: 'Mie Goreng', description: 'Rp 18.000', rowId: 'p2'}
        ]
      },
      {
        title: 'Minuman',
        rows: [
          {title: 'Es Teh', description: 'Rp 5.000', rowId: 'p3'},
          {title: 'Es Jeruk', description: 'Rp 7.000', rowId: 'p4'}
        ]
      }
    ],
    footer: 'Menu Kami'
  })
});
```

### Kirim Poll
```javascript
fetch('http://localhost:3000/api/send-poll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    question: 'Warna favorit kamu?',
    options: ['Merah', 'Biru', 'Hijau', 'Kuning']
  })
});
```

---

## 💬 Message Management

### Reply to Message
```javascript
fetch('http://localhost:3000/api/reply-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    messageId: '3EB0C91D2B1234567890',
    text: 'Ini balasan pesan'
  })
});
```

### React dengan Emoji
```javascript
fetch('http://localhost:3000/api/react-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    messageId: '3EB0C91D2B1234567890',
    emoji: '👍'
  })
});
```

### Delete Message
```javascript
fetch('http://localhost:3000/api/delete-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    messageId: '3EB0C91D2B1234567890',
    forEveryone: true
  })
});
```

---

## 👥 Group Management

### Create Group
```javascript
fetch('http://localhost:3000/api/group/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Tim Project',
    participants: ['628123456789', '628111222333']
  })
});
```

### Add Participants
```javascript
fetch('http://localhost:3000/api/group/add-participants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    groupJid: '120363...@g.us',
    participants: ['628123456789']
  })
});
```

### Get Group Info
```javascript
fetch('http://localhost:3000/api/group/info/120363...@g.us', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Get Invite Link
```javascript
fetch('http://localhost:3000/api/group/invite-link/120363...@g.us', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.inviteLink));
```

---

## 👤 Contact & Profile Features

### Check if Number Registered
```javascript
fetch('http://localhost:3000/api/check-number/628123456789', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.exists));
```

### Get Profile Picture
```javascript
fetch('http://localhost:3000/api/profile-picture/628123456789', {
  headers: { 'X-API-KEY': 'YOUR_API_KEY' }
})
.then(res => res.json())
.then(data => console.log(data.url));
```

### Block/Unblock User
```javascript
// Block
fetch('http://localhost:3000/api/block-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ number: '628123456789' })
});

// Unblock
fetch('http://localhost:3000/api/unblock-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ number: '628123456789' })
});
```

---

## 👁️ Presence & Indicators

### Show Typing Indicator
```javascript
fetch('http://localhost:3000/api/send-typing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    isTyping: true
  })
});

// Stop typing after 3 seconds
setTimeout(() => {
  fetch('http://localhost:3000/api/send-typing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      number: '628123456789',
      isTyping: false
    })
  });
}, 3000);
```

### Show Recording Indicator
```javascript
fetch('http://localhost:3000/api/send-recording', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    number: '628123456789',
    isRecording: true
  })
});
```

---

## 📥 Incoming Messages

### Get Incoming Messages
```javascript
fetch('http://localhost:3000/api/incoming-messages?limit=10', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
})
.then(res => res.json())
.then(data => {
  data.messages.forEach(msg => {
    console.log(`From: ${msg.from}`);
    console.log(`Text: ${msg.message?.conversation}`);
  });
});
```

---

## 🔧 Contoh Lengkap - PHP
```php
<?php
$apiKey = 'YOUR_API_KEY';
$url = 'http://localhost:3000/api/send-message';

$data = [
    'number' => '628123456789',
    'message' => 'Hello from PHP!'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

### Python (Kirim Gambar)
```python
import requests

api_key = 'YOUR_API_KEY'
url = 'http://localhost:3000/api/send-image'

data = {
    'number': '628123456789',
    'imageUrl': 'https://picsum.photos/200',
    'caption': 'Random image from API'
}

headers = {'X-API-Key': api_key}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Node.js / Express
```javascript
const axios = require('axios');

const sendWhatsApp = async (number, message) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/send-message',
      { number, message },
      { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

sendWhatsApp('628123456789', 'Hello from Node.js!');
```

---

## 🔐 Multi API Key untuk Banyak Aplikasi

Anda bisa generate multiple API keys untuk aplikasi berbeda:

1. **App Production**: `wa_abc123...` 
2. **App Development**: `wa_def456...`
3. **App Testing**: `wa_ghi789...`

Setiap API key akan ditrack secara terpisah dengan statistik:
- Jumlah request
- Last used timestamp
- Status (active/revoked)

---

## ⚙️ Tips & Best Practices

### 1. Format Nomor WhatsApp
- ✅ Benar: `628123456789` (62 + nomor tanpa 0)
- ❌ Salah: `08123456789` (jangan pakai 0 di depan)
- ❌ Salah: `+628123456789` (jangan pakai +)

### 2. Keamanan API Key
- Jangan simpan API key di frontend code
- Gunakan environment variables
- Simpan di server backend Anda

### 3. Production Deployment
1. Ganti `ADMIN_KEY` di `.env`:
   ```
   ADMIN_KEY=super_secure_random_string_here
   ```
2. Gunakan HTTPS
3. Restrict CORS jika perlu
4. Monitor logs untuk aktivitas suspicious

### 4. Handle Errors
```javascript
fetch('http://localhost:3000/api/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ number: '628123456789', message: 'Test' })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Pesan terkirim!', data.messageId);
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

---

## 🐛 Troubleshooting

### QR Code tidak muncul
- Pastikan server running dengan `npm start`
- Pastikan sudah generate minimal 1 API key
- Coba restart server

### WhatsApp terputus
- Scan QR code lagi
- Pastikan HP terhubung internet
- Jangan logout dari WhatsApp Web di HP

### Pesan gagal terkirim
- Cek koneksi WhatsApp (status harus "Connected")
- Pastikan format nomor benar (628xxx, bukan 08xxx)
- Pastikan nomor sudah terdaftar di WhatsApp

### API Key Invalid
- Pastikan API key sudah digenerate
- Cek status API key (active/revoked)
- Periksa spelling (case-sensitive)

---

## 📊 Monitoring

Lihat statistik API key di Admin Panel:
- Request count: Berapa kali API key dipakai
- Last used: Kapan terakhir digunakan
- Created: Kapan API key dibuat

---

## 🔄 Update & Maintenance

### Restart Server
```bash
npm start
```

### Logout WhatsApp
Gunakan tombol "Logout WhatsApp" di admin panel untuk disconnect dan scan ulang QR code.

### Revoke API Key
Jika API key bocor atau tidak dipakai lagi, revoke dari admin panel. API key yang di-revoke tidak bisa digunakan lagi.

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check documentation di browser (`http://localhost:3000`)
2. Lihat logs di terminal untuk error messages
3. Pastikan semua dependencies terinstall (`npm install`)

---

**Selamat menggunakan WhatsApp Gateway API! 🎉**

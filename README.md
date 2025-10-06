# WhatsApp Gateway API - Complete Edition

🚀 **Full-Featured WhatsApp Gateway** dengan sistem autentikasi API Key menggunakan Baileys

## 🎯 Multi-Session Architecture

**Fitur Unggulan**: 1 API Key bisa manage multiple WhatsApp sessions!

- ✅ **Multiple Sessions per API Key**: Satu API key bisa connect banyak nomor WhatsApp
- ✅ **Session Isolation**: Setiap session punya QR code dan storage terpisah
- ✅ **Unlimited Scale**: Tambahkan koneksi WhatsApp tanpa batas
- ✅ **Easy Management**: Kelola semua session dengan satu API key

### Cara Kerja

#### Default Session (Otomatis)
```javascript
// Tanpa sessionId = menggunakan session 'default'
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "number": "628123456789",
  "message": "Hello"
}
```

#### Multiple Sessions (Manual)
```javascript
// Session 1: WhatsApp untuk Sales
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "sessionId": "sales",
  "number": "628123456789",
  "message": "Hello from Sales"
}

// Session 2: WhatsApp untuk Support
POST /api/send-message
Headers: X-API-Key: wa_abc123
Body: {
  "sessionId": "support",
  "number": "628123456789",
  "message": "Hello from Support"
}
```

### Storage Structure
```
baileys_auth_info/
  └── wa_abc123/           # API Key
      ├── default/         # Session default
      ├── sales/           # Session sales
      └── support/         # Session support
```

## ✨ Fitur Lengkap (50+ Endpoints)

### 📤 Message Sending
- ✅ Text messages
- ✅ Image dengan caption (URL or **Direct Upload**)
- ✅ Video dengan caption (URL or **Direct Upload**)
- ✅ Audio & Voice notes (PTT) (URL or **Direct Upload**)
- ✅ Documents (PDF, Excel, Word, dll) (URL or **Direct Upload**)
- ✅ Stickers (URL or **Direct Upload**)
- ✅ Location sharing
- ✅ Contact cards (vCard)

### 📤 **File Upload Support**
- ✅ **Direct file upload** tanpa perlu hosting eksternal
- ✅ Support images, videos, audio, documents, stickers
- ✅ Max file size: 50MB
- ✅ Auto file validation
- ✅ 6 upload endpoints tersedia

### 🎮 Interactive Messages
- ✅ Button messages
- ✅ List messages (menu)
- ✅ Poll messages

### 💬 Message Management
- ✅ Reply to messages
- ✅ Forward messages
- ✅ Delete messages
- ✅ React dengan emoji
- ✅ Mark as read
- ✅ Edit messages

### 👥 Group Management
- ✅ Create groups
- ✅ Add/remove participants
- ✅ Promote/demote admins
- ✅ Update group info (name, description)
- ✅ Group invite links
- ✅ Leave groups
- ✅ Accept group invites

### 👤 Contact & Profile
- ✅ Check if number registered
- ✅ Get profile pictures
- ✅ Update own profile picture
- ✅ Update status/about
- ✅ Get business profiles
- ✅ Block/unblock users

### 👁️ Presence & Status
- ✅ Typing indicators
- ✅ Recording indicators
- ✅ Online/offline status
- ✅ Presence subscriptions

### 📥 Incoming Messages
- ✅ Receive & store messages
- ✅ Message webhooks
- ✅ Message history

### 🔑 Security & Management
- ✅ Multiple API Keys
- ✅ API key analytics
- ✅ Request tracking
- ✅ Admin panel UI
- ✅ Full documentation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Jalankan server:
```bash
npm start
```

3. Buka browser: `http://localhost:3000`

## First Time Setup

1. Akses admin panel dengan admin key: `admin123` (default)
2. Generate API key baru untuk aplikasi Anda
3. Klik "Check QR Code" dan scan dengan WhatsApp
4. Gunakan API key untuk kirim pesan

## Environment Variables

Buat file `.env` (optional):
```
PORT=3000
ADMIN_KEY=your_secret_admin_key
```

## 📚 API Endpoints

**Total: 56+ Endpoints** untuk semua fitur WhatsApp

### File Upload (6 endpoints) ⭐ NEW!
- POST `/api/upload` - Upload file saja, get URL
- POST `/api/upload/send-image` - Upload & kirim image
- POST `/api/upload/send-video` - Upload & kirim video
- POST `/api/upload/send-audio` - Upload & kirim audio
- POST `/api/upload/send-document` - Upload & kirim document
- POST `/api/upload/send-sticker` - Upload & kirim sticker

### Message Sending (8 endpoints)
- POST `/api/send-message` - Text
- POST `/api/send-image` - Image + caption
- POST `/api/send-video` - Video + caption
- POST `/api/send-audio` - Audio/Voice
- POST `/api/send-document` - Documents
- POST `/api/send-sticker` - Stickers
- POST `/api/send-location` - GPS Location
- POST `/api/send-contact` - vCard

### Interactive Messages (3 endpoints)
- POST `/api/send-buttons` - Button messages
- POST `/api/send-list` - List/Menu messages
- POST `/api/send-poll` - Poll messages

### Message Management (5 endpoints)
- POST `/api/reply-message`
- POST `/api/forward-message`
- POST `/api/delete-message`
- POST `/api/react-message`
- POST `/api/mark-as-read`

### Group Management (12 endpoints)
- POST `/api/group/create`
- POST `/api/group/add-participants`
- POST `/api/group/remove-participants`
- POST `/api/group/promote`
- POST `/api/group/demote`
- GET `/api/group/info/:groupJid`
- POST `/api/group/update-subject`
- POST `/api/group/update-description`
- POST `/api/group/leave`
- GET `/api/group/invite-link/:groupJid`
- POST `/api/group/revoke-invite`
- POST `/api/group/accept-invite`

### Contact & Profile (7 endpoints)
- GET `/api/check-number/:number`
- GET `/api/profile-picture/:number`
- POST `/api/update-profile-picture`
- POST `/api/update-profile-status`
- POST `/api/block-user`
- POST `/api/unblock-user`
- GET `/api/business-profile/:number`

### Presence & Status (4 endpoints)
- POST `/api/get-presence`
- POST `/api/set-presence`
- POST `/api/send-typing`
- POST `/api/send-recording`

### Incoming Messages (2 endpoints)
- GET `/api/incoming-messages`
- POST `/api/clear-messages`

**Lihat dokumentasi lengkap di `API_DOCUMENTATION.md`**

## Admin Endpoints

Memerlukan admin key di header: `X-Admin-Key: admin123`

- POST /api/admin/apikeys/generate - Generate API key baru (dengan QR code sendiri)
- GET /api/admin/apikeys - List semua API keys dengan analytics
- DELETE /api/admin/apikeys/:key - Hapus API key dan WhatsApp session-nya
- POST /api/admin/apikeys/:key/revoke - Revoke API key tanpa hapus data
- POST /api/admin/logout/:apiKey - Logout WhatsApp connection tertentu

### Connection Management

- GET /api/status - Cek status koneksi untuk session Anda (default: 'default')
- GET /api/qr - Dapatkan QR code untuk scan WhatsApp (per session)

### Session Management

- GET /api/sessions - List semua sessions untuk API key Anda
- DELETE /api/sessions/:sessionId - Hapus session tertentu

**Cara Menggunakan:**
```javascript
// List all sessions
GET /api/sessions
Headers: X-API-Key: wa_abc123

// Get QR for specific session
GET /api/qr?sessionId=sales
Headers: X-API-Key: wa_abc123

// Delete specific session
DELETE /api/sessions/sales
Headers: X-API-Key: wa_abc123
```

## Security

- Ganti `ADMIN_KEY` di production
- Simpan API keys dengan aman
- Jangan commit `api_keys.json` ke git
- Gunakan HTTPS di production

## 📊 Statistics

- **Total Endpoints**: 56+
- **Message Types**: 8 (text, image, video, audio, document, sticker, location, contact)
- **Upload Endpoints**: 6 (direct file upload support)
- **Interactive Types**: 3 (buttons, lists, polls)
- **Group Features**: 12 complete group management
- **Profile Features**: 7 contact & profile operations
- **Real-time Features**: Incoming messages, presence, typing indicators
- **Multi-Session**: ✅ Unlimited sessions per API key

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - REST API Server
- **@whiskeysockets/baileys** - WhatsApp Web Multi-Device API
- **UUID** - Secure API key generation
- **QRCode** - Authentication
- **Pino** - Logging

## 📖 Documentation Files

1. **README.md** - Quick start & overview (this file)
2. **API_DOCUMENTATION.md** - Complete API reference with examples
3. **FILE_UPLOAD_GUIDE.md** - Complete guide for file upload feature ⭐ NEW!
4. **MULTI_SESSION_EXAMPLE.md** - Multi-session tutorial with code examples
5. **TUTORIAL.md** - Step-by-step tutorial
6. **FEATURES.md** - Complete feature list
7. **Web UI** - Interactive documentation at `http://localhost:3000`

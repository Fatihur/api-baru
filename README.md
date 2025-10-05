# WhatsApp Gateway API - Complete Edition

🚀 **Full-Featured WhatsApp Gateway** dengan sistem autentikasi API Key menggunakan Baileys

## ✨ Fitur Lengkap (50+ Endpoints)

### 📤 Message Sending
- ✅ Text messages
- ✅ Image dengan caption
- ✅ Video dengan caption
- ✅ Audio & Voice notes (PTT)
- ✅ Documents (PDF, Excel, Word, dll)
- ✅ Stickers
- ✅ Location sharing
- ✅ Contact cards (vCard)

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

**Total: 50+ Endpoints** untuk semua fitur WhatsApp

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

- POST /api/admin/apikeys/generate - Generate API key baru
- GET /api/admin/apikeys - List semua API keys
- DELETE /api/admin/apikeys/:key - Hapus API key
- POST /api/admin/apikeys/:key/revoke - Revoke API key
- POST /api/admin/logout - Logout dari WhatsApp

## Security

- Ganti `ADMIN_KEY` di production
- Simpan API keys dengan aman
- Jangan commit `api_keys.json` ke git
- Gunakan HTTPS di production

## 📊 Statistics

- **Total Endpoints**: 50+
- **Message Types**: 8 (text, image, video, audio, document, sticker, location, contact)
- **Interactive Types**: 3 (buttons, lists, polls)
- **Group Features**: 12 complete group management
- **Profile Features**: 7 contact & profile operations
- **Real-time Features**: Incoming messages, presence, typing indicators

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - REST API Server
- **@whiskeysockets/baileys** - WhatsApp Web Multi-Device API
- **UUID** - Secure API key generation
- **QRCode** - Authentication
- **Pino** - Logging

## 📖 Documentation Files

1. **README.md** - Quick start & overview (this file)
2. **API_DOCUMENTATION.md** - Complete API reference with examples
3. **TUTORIAL.md** - Step-by-step tutorial
4. **Web UI** - Interactive documentation at `http://localhost:3000`

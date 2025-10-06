# Postman Setup Guide

## 📦 Files

Anda akan menemukan 2 file Postman:

1. **WhatsApp_Gateway_API.postman_environment.json** - Environment variables
2. **WhatsApp_Gateway_API.postman_collection.json** - Complete API collection

## 🚀 Quick Start

### Step 1: Import Environment

1. Buka Postman
2. Click **Environments** di sidebar kiri
3. Click **Import** button
4. Drag & drop file `WhatsApp_Gateway_API.postman_environment.json`
5. Environment berhasil di-import!

### Step 2: Import Collection

1. Click **Collections** di sidebar kiri
2. Click **Import** button
3. Drag & drop file `WhatsApp_Gateway_API.postman_collection.json`
4. Collection berhasil di-import!

### Step 3: Setup Environment Variables

1. Click **Environments** → Select "WhatsApp Gateway API - Environment"
2. Edit environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | Server URL | `http://localhost:3000` |
| `admin_key` | Admin key untuk management | `admin123` |
| `api_key` | API key Anda (generate dulu) | Leave empty, will auto-fill |
| `sessionId` | Session ID untuk multi-session | `default` |
| `test_number` | Nomor untuk testing | `628123456789` |

### Step 4: Generate API Key

1. Pastikan environment sudah aktif (pilih di dropdown kanan atas)
2. Buka folder **"1. Admin - API Key Management"**
3. Run request **"Generate API Key"**
4. API key otomatis tersimpan di variable `api_key` dan `generated_api_key`

### Step 5: Get QR Code

1. Buka folder **"2. Connection & Session Management"**
2. Run request **"Get QR Code"**
3. Copy QR code data URL dari response
4. Paste di browser atau decode untuk scan dengan WhatsApp

### Step 6: Check Status

1. Run request **"Get Status"**
2. Pastikan `connected: true`

### Step 7: Start Testing!

Sekarang Anda bisa test semua endpoints! 🎉

## 📁 Collection Structure

```
WhatsApp Gateway API - Complete Collection
├── 1. Admin - API Key Management (6 requests)
│   ├── Generate API Key
│   ├── List API Keys
│   ├── Revoke API Key
│   ├── Delete API Key
│   ├── Logout All Sessions
│   └── Logout Specific Session
│
├── 2. Connection & Session Management (4 requests)
│   ├── Get Status
│   ├── Get QR Code
│   ├── List All Sessions
│   └── Delete Session
│
├── 3. File Upload (6 requests) ⭐ NEW!
│   ├── Upload File (Get URL)
│   ├── Upload & Send Image
│   ├── Upload & Send Video
│   ├── Upload & Send Audio
│   ├── Upload & Send Document
│   └── Upload & Send Sticker
│
├── 4. Message Sending (URL-based) (8 requests)
│   ├── Send Text Message
│   ├── Send Image (URL)
│   ├── Send Video (URL)
│   ├── Send Audio (URL)
│   ├── Send Document (URL)
│   ├── Send Sticker (URL)
│   ├── Send Location
│   └── Send Contact
│
├── 5. Interactive Messages (3 requests)
│   ├── Send Buttons
│   ├── Send List
│   └── Send Poll
│
├── 6. Message Management (5 requests)
│   ├── Reply to Message
│   ├── Forward Message
│   ├── Delete Message
│   ├── React to Message
│   └── Mark as Read
│
└── 7. Incoming Messages (2 requests)
    ├── Get Incoming Messages
    └── Clear Incoming Messages
```

## 🔑 Environment Variables

### Required (Set manually)

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `base_url` | `http://localhost:3000` | Initial value |
| `admin_key` | `admin123` | Initial value (or your custom) |
| `test_number` | `628123456789` | Your test WhatsApp number |

### Auto-generated (Don't manually set)

| Variable | Auto-set By | Usage |
|----------|-------------|-------|
| `api_key` | Generate API Key request | Used in all API requests |
| `generated_api_key` | Generate API Key request | Backup of generated key |
| `test_message_id` | Send Text Message | Used for reply/delete/react |
| `uploaded_file_url` | Upload File | Used for URL-based sending |
| `test_group_jid` | Create Group | Used for group operations |

## 💡 Tips & Tricks

### 1. Multiple Sessions Testing

Untuk test multiple sessions:

1. Set `sessionId` = `"sales"` di environment
2. Run "Get QR Code" → Scan dengan HP Sales
3. Set `sessionId` = `"support"` 
4. Run "Get QR Code" → Scan dengan HP Support
5. Sekarang Anda punya 2 sessions aktif!

### 2. File Upload Testing

Untuk upload file:

1. Buka request **"Upload & Send Image"**
2. Di tab **Body** → **form-data**
3. Click **"Select Files"** pada field `file`
4. Pilih file image Anda
5. Send request!

### 3. Chaining Requests

Collection ini sudah setup dengan **Tests** script untuk auto-save variables:

```javascript
// Generate API Key → auto save to api_key
// Upload File → auto save to uploaded_file_url
// Send Message → auto save to test_message_id
```

Jadi Anda bisa langsung test reply/react tanpa copy-paste manual!

### 4. Bulk Testing

Untuk test multiple endpoints:

1. Right-click folder (e.g., "Message Sending")
2. Click **"Run folder"**
3. Postman akan run semua request dalam folder secara sequential

## 🐛 Troubleshooting

### Error: "API key is required"

**Solution:**
- Pastikan environment aktif (check dropdown kanan atas)
- Run "Generate API Key" terlebih dahulu
- Variable `api_key` harus terisi

### Error: "Invalid or inactive API key"

**Solution:**
- Generate API key baru
- Pastikan API key tidak di-revoke atau di-delete

### Error: "WhatsApp not connected"

**Solution:**
- Run "Get QR Code"
- Scan QR code dengan WhatsApp
- Run "Get Status" untuk verify

### Error: "No file uploaded"

**Solution:**
- Di tab Body, pastikan Anda pilih file
- Click "Select Files" button
- File size harus < 50MB

### Connection Status: "qr_ready"

**Meaning:** QR code ready untuk di-scan

**Action:**
1. Get QR code via `/api/qr`
2. Scan dengan WhatsApp mobile
3. Wait beberapa detik
4. Run "Get Status" lagi

### Connection Status: "disconnected"

**Meaning:** WhatsApp belum initialized

**Action:**
- Run "Get QR Code" untuk trigger initialization
- Wait beberapa detik untuk QR generation

## 📊 Testing Workflow

### Complete Testing Flow:

```
1. Generate API Key
   ↓
2. Get QR Code
   ↓
3. Scan QR dengan WhatsApp
   ↓
4. Get Status (verify connected)
   ↓
5. Send Text Message (test basic)
   ↓
6. Upload & Send Image (test upload)
   ↓
7. Send Interactive Message (test buttons/list)
   ↓
8. Get Incoming Messages (check received)
   ↓
9. Reply to Message (test management)
   ↓
10. Test other endpoints as needed
```

## 🔄 Multi-Session Testing Flow:

```
Session "default":
1. sessionId = "default"
2. Get QR → Scan with Phone A
3. Send message from "default"

Session "sales":
1. sessionId = "sales"
2. Get QR → Scan with Phone B
3. Send message from "sales"

Session "support":
1. sessionId = "support"
2. Get QR → Scan with Phone C
3. Send message from "support"

Result: 3 active WhatsApp connections!
```

## 📝 Advanced Usage

### Custom Scripts

You can add custom test scripts to any request:

```javascript
// Example: Save custom variable
pm.environment.set("custom_var", "value");

// Example: Assert response
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

// Example: Extract from response
const response = pm.response.json();
pm.environment.set("message_id", response.messageId);
```

### Pre-request Scripts

Add logic before request:

```javascript
// Example: Generate timestamp
pm.environment.set("timestamp", Date.now());

// Example: Dynamic sessionId
const sessions = ["default", "sales", "support"];
const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
pm.environment.set("sessionId", randomSession);
```

## 🎯 Quick Reference

### Admin Endpoints

```
POST   /api/admin/apikeys/generate         Generate API key
GET    /api/admin/apikeys                  List all keys
DELETE /api/admin/apikeys/:key             Delete key
POST   /api/admin/apikeys/:key/revoke      Revoke key
POST   /api/admin/logout/:apiKey           Logout session(s)
```

### Connection Endpoints

```
GET    /api/status                         Connection status
GET    /api/qr                            Get QR code
GET    /api/sessions                      List sessions
DELETE /api/sessions/:sessionId           Delete session
```

### Upload Endpoints

```
POST   /api/upload                        Upload only
POST   /api/upload/send-image            Upload & send
POST   /api/upload/send-video            Upload & send
POST   /api/upload/send-audio            Upload & send
POST   /api/upload/send-document         Upload & send
POST   /api/upload/send-sticker          Upload & send
```

### Message Endpoints

```
POST   /api/send-message                  Text
POST   /api/send-image                    Image
POST   /api/send-video                    Video
POST   /api/send-audio                    Audio
POST   /api/send-document                 Document
POST   /api/send-sticker                  Sticker
POST   /api/send-location                 Location
POST   /api/send-contact                  Contact
```

## 🆘 Support

Jika mengalami masalah:

1. Check server logs
2. Verify environment variables
3. Re-generate API key
4. Restart server
5. Re-scan QR code

## ✅ Checklist

Sebelum mulai testing:

- [ ] Server running (`npm start`)
- [ ] Environment imported & selected
- [ ] Collection imported
- [ ] `base_url` set correctly
- [ ] `admin_key` set correctly
- [ ] `test_number` set to your WhatsApp number
- [ ] API key generated
- [ ] QR code scanned
- [ ] Status = connected

Happy Testing! 🚀

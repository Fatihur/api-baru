# File Upload Guide

## 📤 Overview

API ini sekarang mendukung **direct file upload**! Anda bisa upload file langsung tanpa perlu host di tempat lain terlebih dahulu.

## 🎯 Supported File Types

### Images
- JPEG, JPG, PNG, GIF, WebP, BMP
- Max size: 50MB

### Videos
- MP4, MPEG, QuickTime, AVI, MKV
- Max size: 50MB

### Audio
- MP3, WAV, OGG, WebM, M4A
- Max size: 50MB

### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- TXT, ZIP, RAR, 7Z
- Max size: 50MB

## 📁 Endpoints

### 1. Upload File Only

Upload file dan dapatkan URL untuk digunakan nanti.

```bash
POST /api/upload
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [your file]
```

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "myimage-1234567890.jpg",
    "originalName": "myimage.jpg",
    "mimetype": "image/jpeg",
    "size": 123456,
    "category": "image",
    "url": "http://localhost:3000/uploads/myimage-1234567890.jpg",
    "path": "/uploads/myimage-1234567890.jpg"
  },
  "message": "File uploaded successfully"
}
```

### 2. Upload & Send Image

Upload image dan langsung kirim ke WhatsApp.

```bash
POST /api/upload/send-image
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [image file]
- number: 628123456789
- caption: "Hello World!" (optional)
- sessionId: sales (optional)
```

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "photo-1234567890.jpg",
    "url": "http://localhost:3000/uploads/photo-1234567890.jpg"
  },
  "messageId": "3EB0C91D2B..."
}
```

### 3. Upload & Send Video

```bash
POST /api/upload/send-video
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [video file]
- number: 628123456789
- caption: "Check this out!" (optional)
- sessionId: sales (optional)
```

### 4. Upload & Send Audio

```bash
POST /api/upload/send-audio
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [audio file]
- number: 628123456789
- ptt: true (for voice note) or false (for audio)
- sessionId: sales (optional)
```

### 5. Upload & Send Document

```bash
POST /api/upload/send-document
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [document file]
- number: 628123456789
- fileName: "Custom Name.pdf" (optional, uses original name if not provided)
- sessionId: sales (optional)
```

### 6. Upload & Send Sticker

```bash
POST /api/upload/send-sticker
Content-Type: multipart/form-data
Headers: X-API-Key: your_api_key

Form Data:
- file: [sticker file - WebP format]
- number: 628123456789
- sessionId: sales (optional)
```

## 💻 Code Examples

### JavaScript (Browser)

```html
<input type="file" id="fileInput" />
<button onclick="uploadAndSend()">Upload & Send</button>

<script>
async function uploadAndSend() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('number', '628123456789');
  formData.append('caption', 'Hello from browser!');
  formData.append('sessionId', 'sales');
  
  const response = await fetch('http://localhost:3000/api/upload/send-image', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your_api_key'
    },
    body: formData
  });
  
  const result = await response.json();
  console.log(result);
}
</script>
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadAndSendImage() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('/path/to/image.jpg'));
  formData.append('number', '628123456789');
  formData.append('caption', 'Hello from Node.js!');
  formData.append('sessionId', 'sales');
  
  const response = await axios.post(
    'http://localhost:3000/api/upload/send-image',
    formData,
    {
      headers: {
        'X-API-Key': 'your_api_key',
        ...formData.getHeaders()
      }
    }
  );
  
  console.log(response.data);
}

uploadAndSendImage();
```

### Python

```python
import requests

def upload_and_send_image():
    url = 'http://localhost:3000/api/upload/send-image'
    
    files = {
        'file': open('/path/to/image.jpg', 'rb')
    }
    
    data = {
        'number': '628123456789',
        'caption': 'Hello from Python!',
        'sessionId': 'sales'
    }
    
    headers = {
        'X-API-Key': 'your_api_key'
    }
    
    response = requests.post(url, files=files, data=data, headers=headers)
    print(response.json())

upload_and_send_image()
```

### PHP

```php
<?php
$url = 'http://localhost:3000/api/upload/send-image';

$file = new CURLFile('/path/to/image.jpg');

$postData = [
    'file' => $file,
    'number' => '628123456789',
    'caption' => 'Hello from PHP!',
    'sessionId' => 'sales'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: your_api_key'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

### cURL

```bash
# Upload only
curl -X POST http://localhost:3000/api/upload \
  -H "X-API-Key: your_api_key" \
  -F "file=@/path/to/image.jpg"

# Upload and send image
curl -X POST http://localhost:3000/api/upload/send-image \
  -H "X-API-Key: your_api_key" \
  -F "file=@/path/to/image.jpg" \
  -F "number=628123456789" \
  -F "caption=Hello World!" \
  -F "sessionId=sales"

# Upload and send document
curl -X POST http://localhost:3000/api/upload/send-document \
  -H "X-API-Key: your_api_key" \
  -F "file=@/path/to/document.pdf" \
  -F "number=628123456789" \
  -F "fileName=Important Document.pdf" \
  -F "sessionId=sales"

# Upload and send audio (voice note)
curl -X POST http://localhost:3000/api/upload/send-audio \
  -H "X-API-Key: your_api_key" \
  -F "file=@/path/to/audio.mp3" \
  -F "number=628123456789" \
  -F "ptt=true" \
  -F "sessionId=sales"
```

## 🔄 Two Workflows

### Workflow 1: Upload kemudian Kirim

```javascript
// Step 1: Upload file
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'X-API-Key': 'your_api_key' },
  body: formData
});

const { file } = await uploadResponse.json();

// Step 2: Gunakan URL untuk kirim (URL-based endpoint)
await fetch('/api/send-image', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '628123456789',
    imageUrl: file.url,
    caption: 'Hello!'
  })
});
```

### Workflow 2: Upload & Kirim Langsung

```javascript
// One step: Upload dan kirim sekaligus
const formData = new FormData();
formData.append('file', file);
formData.append('number', '628123456789');
formData.append('caption', 'Hello!');

await fetch('/api/upload/send-image', {
  method: 'POST',
  headers: { 'X-API-Key': 'your_api_key' },
  body: formData
});
```

## 📊 File Storage

- Files disimpan di folder `/uploads`
- Filename format: `{originalname}-{timestamp}-{random}.{ext}`
- Files dapat diakses via URL: `http://localhost:3000/uploads/{filename}`
- Auto cleanup: Implementasikan scheduled task untuk hapus file lama

## 🔒 Security

### File Validation
- ✅ File type checking berdasarkan mimetype
- ✅ File size limit: 50MB
- ✅ Filename sanitization
- ✅ Only allowed file types

### Best Practices
1. **Jangan expose uploads folder** di production tanpa authentication
2. **Implement rate limiting** untuk upload endpoints
3. **Schedule cleanup** untuk file lama (contoh: hapus file > 24 jam)
4. **Monitor disk space** karena uploads akan menggunakan storage

## 🧹 Cleanup Old Files

Tambahkan cron job atau scheduled task:

```javascript
const { cleanupOldFiles } = require('./uploadConfig');

// Run every hour - cleanup files older than 24 hours
setInterval(() => {
  cleanupOldFiles(24);
}, 60 * 60 * 1000);
```

Atau di server.js:
```javascript
// Cleanup on server start
const { cleanupOldFiles } = require('./uploadConfig');
cleanupOldFiles(24);

// Schedule cleanup every 6 hours
setInterval(() => {
  cleanupOldFiles(24);
}, 6 * 60 * 60 * 1000);
```

## ⚠️ Error Handling

### File Too Large
```json
{
  "success": false,
  "error": "File too large"
}
```

### Invalid File Type
```json
{
  "success": false,
  "error": "File type not allowed: application/exe. Allowed types: images, videos, audio, documents"
}
```

### No File Uploaded
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

## 🎯 Use Cases

### 1. Mobile App Upload
User take photo → Upload via `/api/upload/send-image` → Langsung terkirim

### 2. Web Dashboard
Admin upload document → Get URL → Store URL in database → Send later via URL-based endpoint

### 3. Bulk Upload
Upload multiple files → Store URLs → Send batch messages menggunakan URLs

### 4. Real-time Chat
User attach file → Upload → Send immediately

## 📝 Summary

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `POST /api/upload` | Upload only | File info + URL |
| `POST /api/upload/send-image` | Upload & send image | File info + messageId |
| `POST /api/upload/send-video` | Upload & send video | File info + messageId |
| `POST /api/upload/send-audio` | Upload & send audio | File info + messageId |
| `POST /api/upload/send-document` | Upload & send document | File info + messageId |
| `POST /api/upload/send-sticker` | Upload & send sticker | File info + messageId |

**Semua endpoint mendukung `sessionId` untuk multi-session!**

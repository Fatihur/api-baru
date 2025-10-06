const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, downloadMediaMessage, getContentType, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class WhatsAppClient {
  constructor(apiKey, sessionId = 'default') {
    this.apiKey = apiKey;
    this.sessionId = sessionId;
    this.authPath = path.join(__dirname, 'baileys_auth_info', apiKey, sessionId);
    this.sock = null;
    this.qr = null;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.messageHandlers = [];
    this.incomingMessages = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseReconnectDelay = 3000;
    this.isInitializing = false;
  }

  async initialize() {
    if (this.isInitializing) {
      console.log(`[${this.apiKey}:${this.sessionId}] Already initializing, skipping...`);
      return;
    }
    
    this.isInitializing = true;
    
    try {
      if (!fs.existsSync(this.authPath)) {
        fs.mkdirSync(this.authPath, { recursive: true });
      }
      
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['WhatsApp Gateway', 'Chrome', '1.0.0'],
        printQRInTerminal: false,
        syncFullHistory: false
      });

      this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qr = await QRCode.toDataURL(qr);
          this.connectionStatus = 'qr_ready';
          console.log(`[${this.apiKey}:${this.sessionId}] QR Code generated`);
        }

        if (connection === 'close') {
        this.isInitializing = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`[${this.apiKey}:${this.sessionId}] Connection closed. Status: ${statusCode}, Should reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delayMs = Math.min(this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 60000);
            this.connectionStatus = 'reconnecting';
            console.log(`[${this.apiKey}:${this.sessionId}] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delayMs}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delayMs));
            try {
              await this.initialize();
            } catch (error) {
              console.error(`[${this.apiKey}:${this.sessionId}] Reconnection failed:`, error.message);
            }
          } else {
            console.error(`[${this.apiKey}:${this.sessionId}] Max reconnection attempts reached. Please restart manually.`);
            this.connectionStatus = 'failed';
            this.isConnected = false;
          }
        } else {
          console.log(`[${this.apiKey}:${this.sessionId}] Logged out from WhatsApp`);
          this.connectionStatus = 'logged_out';
          this.isConnected = false;
          this.reconnectAttempts = 0;
        }
        } else if (connection === 'open') {
          console.log(`[${this.apiKey}:${this.sessionId}] WhatsApp connected successfully`);
          this.isConnected = true;
          this.connectionStatus = 'connected';
          this.qr = null;
          this.reconnectAttempts = 0;
          this.isInitializing = false;
        }
      } catch (error) {
        console.error(`[${this.apiKey}:${this.sessionId}] Connection update error:`, error);
        this.isInitializing = false;
      }
    });

      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
          for (const msg of messages) {
            if (!msg.key.fromMe && type === 'notify') {
              console.log(`[${this.apiKey}:${this.sessionId}] Received message:`, msg.key.id);
              this.incomingMessages.push({
                id: msg.key.id,
                from: msg.key.remoteJid,
                fromMe: msg.key.fromMe,
                timestamp: msg.messageTimestamp,
                message: msg.message,
                pushName: msg.pushName,
                type: getContentType(msg.message)
              });
              
              if (this.incomingMessages.length > 100) {
                this.incomingMessages.shift();
              }
              
              for (const handler of this.messageHandlers) {
                try {
                  handler(msg);
                } catch (error) {
                  console.error(`[${this.apiKey}:${this.sessionId}] Message handler error:`, error);
                }
              }
            }
          }
        } catch (error) {
          console.error(`[${this.apiKey}:${this.sessionId}] Messages upsert error:`, error);
        }
      });

      // Handle WebSocket errors
      this.sock.ev.on('connection.error', (error) => {
        console.error(`[${this.apiKey}:${this.sessionId}] Connection error:`, error);
      });

    } catch (error) {
      this.isInitializing = false;
      console.error(`[${this.apiKey}:${this.sessionId}] Initialize error:`, error);
      throw error;
    }
  }

  async sendMessage(number, message) {
    if (!this.isConnected) {
      const error = new Error('WhatsApp not connected');
      error.code = 'WA_DISCONNECTED';
      error.status = this.connectionStatus;
      error.qr = this.qr;
      throw error;
    }

    const formattedNumber = number.includes('@s.whatsapp.net') 
      ? number 
      : `${number.replace(/\D/g, '')}@s.whatsapp.net`;

    try {
      const result = await this.sock.sendMessage(formattedNumber, { text: message });
      return { success: true, messageId: result.key.id };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendImage(number, imageUrl, caption = '') {
    if (!this.isConnected) {
      throw new Error('WhatsApp not connected');
    }

    const formattedNumber = number.includes('@s.whatsapp.net') 
      ? number 
      : `${number.replace(/\D/g, '')}@s.whatsapp.net`;

    try {
      const result = await this.sock.sendMessage(formattedNumber, {
        image: { url: imageUrl },
        caption: caption
      });
      return { success: true, messageId: result.key.id };
    } catch (error) {
      throw new Error(`Failed to send image: ${error.message}`);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      status: this.connectionStatus,
      qr: this.qr
    };
  }

  async sendVideo(number, videoUrl, caption = '') {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const result = await this.sock.sendMessage(jid, {
      video: { url: videoUrl },
      caption: caption
    });
    return { success: true, messageId: result.key.id };
  }

  async sendAudio(number, audioUrl, ptt = false) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const result = await this.sock.sendMessage(jid, {
      audio: { url: audioUrl },
      mimetype: ptt ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
      ptt: ptt
    });
    return { success: true, messageId: result.key.id };
  }

  async sendDocument(number, documentUrl, fileName, mimetype = 'application/pdf') {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const result = await this.sock.sendMessage(jid, {
      document: { url: documentUrl },
      fileName: fileName,
      mimetype: mimetype
    });
    return { success: true, messageId: result.key.id };
  }

  async sendSticker(number, stickerUrl) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const result = await this.sock.sendMessage(jid, {
      sticker: { url: stickerUrl }
    });
    return { success: true, messageId: result.key.id };
  }

  async sendLocation(number, latitude, longitude, name = '', address = '') {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const result = await this.sock.sendMessage(jid, {
      location: {
        degreesLatitude: parseFloat(latitude),
        degreesLongitude: parseFloat(longitude),
        name: name,
        address: address
      }
    });
    return { success: true, messageId: result.key.id };
  }

  async sendContact(number, contactName, contactNumber) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${contactNumber}:+${contactNumber}\nEND:VCARD`;
    const result = await this.sock.sendMessage(jid, {
      contacts: {
        displayName: contactName,
        contacts: [{ vcard }]
      }
    });
    return { success: true, messageId: result.key.id };
  }

  async sendButtons(number, text, buttons, footer = '', imageUrl = null) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    const buttonMessages = buttons.map((btn, index) => ({
      buttonId: btn.id || `btn_${index}`,
      buttonText: { displayText: btn.text },
      type: 1
    }));

    const messageContent = {
      text: text,
      footer: footer,
      buttons: buttonMessages,
      headerType: imageUrl ? 4 : 1
    };

    if (imageUrl) {
      messageContent.image = { url: imageUrl };
    }

    const result = await this.sock.sendMessage(jid, messageContent);
    return { success: true, messageId: result.key.id };
  }

  async sendList(number, text, buttonText, sections, footer = '', title = '') {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    const result = await this.sock.sendMessage(jid, {
      text: text,
      footer: footer,
      title: title,
      buttonText: buttonText,
      sections: sections
    });
    return { success: true, messageId: result.key.id };
  }

  async sendPoll(number, question, options) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    const result = await this.sock.sendMessage(jid, {
      poll: {
        name: question,
        values: options,
        selectableCount: 1
      }
    });
    return { success: true, messageId: result.key.id };
  }

  async replyMessage(number, messageId, text) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    const result = await this.sock.sendMessage(jid, {
      text: text
    }, {
      quoted: { key: { remoteJid: jid, id: messageId, fromMe: false }, message: { conversation: '' } }
    });
    return { success: true, messageId: result.key.id };
  }

  async forwardMessage(toNumber, fromNumber, messageId) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const toJid = this.formatJid(toNumber);
    const fromJid = this.formatJid(fromNumber);
    
    const result = await this.sock.sendMessage(toJid, {
      forward: {
        key: { remoteJid: fromJid, id: messageId, fromMe: false },
        message: { conversation: '' }
      }
    });
    return { success: true, messageId: result.key.id };
  }

  async deleteMessage(number, messageId, forEveryone = true) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    await this.sock.sendMessage(jid, {
      delete: {
        remoteJid: jid,
        id: messageId,
        participant: forEveryone ? undefined : jid,
        fromMe: true
      }
    });
    return { success: true, message: 'Message deleted' };
  }

  async reactToMessage(number, messageId, emoji) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    
    await this.sock.sendMessage(jid, {
      react: {
        text: emoji,
        key: { remoteJid: jid, id: messageId, fromMe: false }
      }
    });
    return { success: true, message: 'Reaction sent' };
  }

  async createGroup(name, participants) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const participantJids = participants.map(p => this.formatJid(p));
    
    const group = await this.sock.groupCreate(name, participantJids);
    return { success: true, groupId: group.id, groupJid: group.gid };
  }

  async addParticipants(groupJid, participants) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const participantJids = participants.map(p => this.formatJid(p));
    
    const result = await this.sock.groupParticipantsUpdate(groupJid, participantJids, 'add');
    return { success: true, result };
  }

  async removeParticipants(groupJid, participants) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const participantJids = participants.map(p => this.formatJid(p));
    
    const result = await this.sock.groupParticipantsUpdate(groupJid, participantJids, 'remove');
    return { success: true, result };
  }

  async promoteParticipants(groupJid, participants) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const participantJids = participants.map(p => this.formatJid(p));
    
    const result = await this.sock.groupParticipantsUpdate(groupJid, participantJids, 'promote');
    return { success: true, result };
  }

  async demoteParticipants(groupJid, participants) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const participantJids = participants.map(p => this.formatJid(p));
    
    const result = await this.sock.groupParticipantsUpdate(groupJid, participantJids, 'demote');
    return { success: true, result };
  }

  async getGroupInfo(groupJid) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const metadata = await this.sock.groupMetadata(groupJid);
    return { success: true, group: metadata };
  }

  async updateGroupSubject(groupJid, subject) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    await this.sock.groupUpdateSubject(groupJid, subject);
    return { success: true, message: 'Group subject updated' };
  }

  async updateGroupDescription(groupJid, description) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    await this.sock.groupUpdateDescription(groupJid, description);
    return { success: true, message: 'Group description updated' };
  }

  async leaveGroup(groupJid) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    await this.sock.groupLeave(groupJid);
    return { success: true, message: 'Left group' };
  }

  async getGroupInviteLink(groupJid) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const code = await this.sock.groupInviteCode(groupJid);
    return { success: true, inviteLink: `https://chat.whatsapp.com/${code}` };
  }

  async revokeGroupInviteLink(groupJid) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const code = await this.sock.groupRevokeInvite(groupJid);
    return { success: true, newInviteLink: `https://chat.whatsapp.com/${code}` };
  }

  async acceptGroupInvite(inviteCode) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const result = await this.sock.groupAcceptInvite(inviteCode);
    return { success: true, groupJid: result };
  }

  async checkNumberRegistered(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const [result] = await this.sock.onWhatsApp(jid);
    return { 
      success: true, 
      exists: result?.exists || false,
      jid: result?.jid
    };
  }

  async getProfilePicture(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    try {
      const url = await this.sock.profilePictureUrl(jid, 'image');
      return { success: true, url };
    } catch (error) {
      return { success: false, error: 'Profile picture not available' };
    }
  }

  async updateProfilePicture(imagePath) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const image = fs.readFileSync(imagePath);
    await this.sock.updateProfilePicture(this.sock.user.id, image);
    return { success: true, message: 'Profile picture updated' };
  }

  async updateProfileStatus(status) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    await this.sock.updateProfileStatus(status);
    return { success: true, message: 'Status updated' };
  }

  async getPresence(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.presenceSubscribe(jid);
    return { success: true, message: 'Subscribed to presence updates' };
  }

  async setPresence(type = 'available') {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    await this.sock.sendPresenceUpdate(type);
    return { success: true, message: `Presence set to ${type}` };
  }

  async markAsRead(number, messageId) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.readMessages([{ remoteJid: jid, id: messageId, fromMe: false }]);
    return { success: true, message: 'Message marked as read' };
  }

  async sendTyping(number, isTyping = true) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.sendPresenceUpdate(isTyping ? 'composing' : 'paused', jid);
    return { success: true, message: isTyping ? 'Typing...' : 'Stopped typing' };
  }

  async sendRecording(number, isRecording = true) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.sendPresenceUpdate(isRecording ? 'recording' : 'paused', jid);
    return { success: true, message: isRecording ? 'Recording...' : 'Stopped recording' };
  }

  async blockUser(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.updateBlockStatus(jid, 'block');
    return { success: true, message: 'User blocked' };
  }

  async unblockUser(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    await this.sock.updateBlockStatus(jid, 'unblock');
    return { success: true, message: 'User unblocked' };
  }

  async getBusinessProfile(number) {
    if (!this.isConnected) throw new Error('WhatsApp not connected');
    const jid = this.formatJid(number);
    const profile = await this.sock.getBusinessProfile(jid);
    return { success: true, profile };
  }

  getIncomingMessages(limit = 50) {
    return this.incomingMessages.slice(-limit);
  }

  clearIncomingMessages() {
    this.incomingMessages = [];
    return { success: true, message: 'Messages cleared' };
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  formatJid(number) {
    if (number.includes('@g.us')) return number;
    if (number.includes('@s.whatsapp.net')) return number;
    return `${number.replace(/\D/g, '')}@s.whatsapp.net`;
  }

  async logout() {
    if (this.sock) {
      await this.sock.logout();
      this.isConnected = false;
      this.connectionStatus = 'logged_out';
      console.log(`[${this.apiKey}:${this.sessionId}] Logged out`);
    }
  }
}

module.exports = WhatsAppClient;

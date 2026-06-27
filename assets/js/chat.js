// chat.js - Full chat client with username entry

class ChatClient {
  constructor() {
    this.ws = null;
    this.messages = [];
    this.users = [];
    this.username = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.typingTimeout = null;
    this.isTyping = false;
    this.isUsernameSet = false;
    
    this.init();
  }

  init() {
    this.createChatUI();
    this.showUsernameModal();
    this.loadHistory();
  }

  showUsernameModal() {
    const savedUsername = localStorage.getItem('chat_username');
    if (savedUsername) {
      this.username = savedUsername;
      this.isUsernameSet = true;
      this.connect();
      return;
    }

    // Create username modal
    const modal = document.createElement('div');
    modal.id = 'chat-username-modal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
      <div class="chat-modal-content">
        <div class="chat-modal-header">
          <span class="chat-modal-title">✦ enter chat</span>
        </div>
        <div class="chat-modal-body">
          <p class="chat-modal-desc">Choose a username to join the chat</p>
          <input type="text" id="chat-username-input" class="chat-modal-input" 
                 placeholder="username" maxlength="20" autofocus />
          <div class="chat-modal-error" id="chat-username-error"></div>
          <button id="chat-username-join" class="chat-modal-btn">join chat →</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById('chat-username-input');
    const joinBtn = document.getElementById('chat-username-join');
    const errorEl = document.getElementById('chat-username-error');

    const joinChat = () => {
      const username = input.value.trim();
      if (!username) {
        errorEl.textContent = '⚠️ Please enter a username';
        return;
      }
      if (!/^[a-zA-Z0-9_\s]+$/.test(username)) {
        errorEl.textContent = '⚠️ Only letters, numbers, spaces, and underscores allowed';
        return;
      }
      if (username.length > 20) {
        errorEl.textContent = '⚠️ Username must be 20 characters or less';
        return;
      }

      this.username = username;
      this.isUsernameSet = true;
      localStorage.setItem('chat_username', username);
      modal.classList.add('fade-out');
      setTimeout(() => {
        modal.remove();
        this.connect();
      }, 300);
    };

    joinBtn.addEventListener('click', joinChat);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') joinChat();
    });
    input.focus();
  }

  createChatUI() {
    if (document.getElementById('chat-container')) return;

    const chatHTML = `
      <div id="chat-container" class="chat-container">
        <div class="chat-header" id="chat-toggle">
          <span class="chat-title">✦ chat</span>
          <span class="chat-status" id="chat-status">●</span>
          <span class="chat-users" id="chat-user-count">0</span>
        </div>
        <div class="chat-body" id="chat-body">
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-typing" id="chat-typing"></div>
          <div class="chat-input-area">
            <input type="text" class="chat-input" id="chat-input" 
                   placeholder="Type a message..." maxlength="500" disabled />
            <button class="chat-send-btn" id="chat-send-btn" disabled>→</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Setup event listeners
    const toggle = document.getElementById('chat-toggle');
    const body = document.getElementById('chat-body');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    toggle.addEventListener('click', () => {
      body.classList.toggle('open');
      if (body.classList.contains('open') && this.isConnected) {
        input.focus();
      }
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });

    input.addEventListener('input', () => {
      this.handleTyping();
    });

    // Auto-open chat after a few seconds
    setTimeout(() => {
      body.classList.add('open');
    }, 4000);
  }

  connect() {
    if (!this.isUsernameSet) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://api.wxrn.lol/chat/ws?username=${encodeURIComponent(this.username)}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🟢 Connected to chat');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
        this.enableInput(true);
        this.showNotification('Connected to chat', 'success');
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('🔴 Disconnected from chat');
        this.isConnected = false;
        this.updateStatus('disconnected');
        this.enableInput(false);
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateStatus('error');
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.showNotification('Connection lost. Refresh to reconnect.', 'error');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000);
    
    console.log(`Reconnecting in ${delay/1000}s... (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  handleMessage(data) {
    try {
      const parsed = JSON.parse(data);
      
      switch (parsed.type) {
        case 'history':
          this.messages = parsed.data;
          this.renderMessages();
          break;
          
        case 'new_message':
          this.messages.push(parsed.data);
          this.renderMessages();
          if (parsed.data.username !== this.username && !parsed.data.isSystem) {
            this.showNotification(`${parsed.data.username}: ${parsed.data.message.substring(0, 30)}...`);
          }
          break;
          
        case 'users':
          this.users = parsed.data;
          this.updateUserCount();
          break;
          
        case 'typing':
          this.showTyping(parsed.data);
          break;
          
        case 'error':
          console.warn('Chat error:', parsed.data.message);
          this.showNotification(parsed.data.message, 'error');
          break;
          
        default:
          console.log('Unknown message type:', parsed.type);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    if (!this.isConnected) {
      this.showNotification('Not connected to chat', 'error');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'message',
      message: message
    }));

    input.value = '';
    this.isTyping = false;
    clearTimeout(this.typingTimeout);
  }

  handleTyping() {
    const input = document.getElementById('chat-input');
    const isCurrentlyTyping = input.value.length > 0;
    
    if (isCurrentlyTyping !== this.isTyping && this.isConnected) {
      this.isTyping = isCurrentlyTyping;
      this.ws.send(JSON.stringify({
        type: 'typing',
        isTyping: this.isTyping
      }));
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      if (this.isTyping) {
        this.isTyping = false;
        if (this.isConnected) {
          this.ws.send(JSON.stringify({
            type: 'typing',
            isTyping: false
          }));
        }
      }
    }, 2000);
  }

  renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Check if we need to preserve scroll position
    const shouldAutoScroll = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    
    const currentCount = container.children.length;
    const newMessages = this.messages.slice(currentCount);
    
    if (newMessages.length === 0 && this.messages.length > 0 && currentCount === 0) {
      container.innerHTML = '';
      this.messages.forEach(msg => {
        container.appendChild(this.createMessageElement(msg));
      });
      this.scrollToBottom();
      return;
    }

    newMessages.forEach(msg => {
      container.appendChild(this.createMessageElement(msg));
    });

    if (newMessages.length > 0 && shouldAutoScroll) {
      this.scrollToBottom();
    }
  }

  createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `chat-message ${message.isSystem ? 'system' : ''}`;
    div.dataset.userId = message.userId;

    if (message.isSystem) {
      div.innerHTML = `
        <span class="chat-msg-system">${this.escapeHtml(message.message)}</span>
        <span class="chat-msg-time">${this.formatTime(message.timestamp)}</span>
      `;
    } else {
      const isOwn = message.username === this.username;
      div.innerHTML = `
        <span class="chat-msg-username" style="color: ${this.getUserColor(message.userId)}">${this.escapeHtml(message.username)}</span>
        <span class="chat-msg-text">${this.escapeHtml(message.message)}</span>
        <span class="chat-msg-time">${this.formatTime(message.timestamp)}</span>
      `;
    }

    return div;
  }

  showTyping(data) {
    const container = document.getElementById('chat-typing');
    if (!container) return;

    if (data.isTyping && data.username !== this.username) {
      container.textContent = `${data.username} is typing...`;
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Flash the chat toggle
    const toggle = document.getElementById('chat-toggle');
    if (toggle) {
      const colors = {
        info: 'rgba(159, 74, 198, 0.2)',
        success: 'rgba(74, 222, 128, 0.2)',
        error: 'rgba(248, 113, 113, 0.2)'
      };
      toggle.style.backgroundColor = colors[type] || colors.info;
      setTimeout(() => {
        toggle.style.backgroundColor = '';
      }, 1500);
    }

    // Update status icon
    const status = document.getElementById('chat-status');
    if (status) {
      if (type === 'success') status.style.color = '#4ade80';
      if (type === 'error') status.style.color = '#f87171';
    }
  }

  updateStatus(status) {
    const statusEl = document.getElementById('chat-status');
    if (!statusEl) return;

    const colors = {
      connected: '#4ade80',
      disconnected: '#f87171',
      error: '#fb923c',
      connecting: '#facc15'
    };

    statusEl.style.color = colors[status] || '#f87171';
    statusEl.title = status.charAt(0).toUpperCase() + status.slice(1);
  }

  updateUserCount() {
    const countEl = document.getElementById('chat-user-count');
    if (countEl) {
      countEl.textContent = this.users.length;
    }
  }

  enableInput(enabled) {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    if (input) input.disabled = !enabled;
    if (sendBtn) sendBtn.disabled = !enabled;
  }

  scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  getUserColor(userId) {
    const colors = [
      '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', 
      '#60a5fa', '#818cf8', '#c084fc', '#f472b6'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async loadHistory() {
    try {
      const response = await fetch('https://api.wxrn.lol/chat/history?limit=50');
      if (response.ok) {
        const data = await response.json();
        this.messages = data.messages || [];
        this.users = data.users || [];
        this.renderMessages();
        this.updateUserCount();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.chatClient = new ChatClient();
  }, 1500);
});
class ChatClient {
  constructor() {
    this.ws = null;
    this.messages = [];
    this.users = [];
    this.username = null;
    this.userId = null;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.typingTimeout = null;
    this.isTyping = false;
    this.isChatOpen = false;
    this.useHttpFallback = false;
    this.messageQueue = [];
    this.historyLoaded = false;
    
    this.init();
  }

  init() {
    console.log('💬 ChatClient initializing...');
    this.createChatUI();
    this.setupChatToggle();
    this.setupChatInput();
    
    // Load history after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.loadHistory();
    }, 500);
  }

  createChatUI() {
    if (document.getElementById('chat-container')) return;

    const chatHTML = `
      <div id="chat-container" class="chat-container">
        <div class="chat-header" id="chat-toggle">
          <span class="chat-title">✦ chat</span>
          <span class="chat-status" id="chat-status">●</span>
          <span class="chat-users" id="chat-user-count">0</span>
          <span class="chat-toggle-arrow">▸</span>
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
    console.log('✅ Chat UI created');
  }

  setupChatToggle() {
    const toggle = document.getElementById('chat-toggle');
    const body = document.getElementById('chat-body');
    const arrow = document.querySelector('.chat-toggle-arrow');

    toggle.addEventListener('click', () => {
      this.isChatOpen = !this.isChatOpen;
      body.classList.toggle('open');
      arrow.textContent = this.isChatOpen ? '▾' : '▸';
      
      console.log('Chat toggled:', this.isChatOpen ? 'open' : 'closed');
      
      if (this.isChatOpen && !this.isAuthenticated) {
        this.showAuthModal();
      }
      
      if (this.isChatOpen && this.isAuthenticated && this.isConnected) {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      }
      
      // If chat is opened and we have messages, render them
      if (this.isChatOpen && this.messages.length > 0) {
        console.log('Rendering messages on chat open');
        this.renderMessages();
      }
    });
  }

  setupChatInput() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (!input || !sendBtn) return;

    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    input.addEventListener('input', () => {
      this.handleTyping();
    });
    
    console.log('✅ Chat input setup complete');
  }

  // ============================================
  // AUTH MODAL METHODS
  // ============================================

  showAuthModal() {
    if (this.isAuthenticated) return;
    if (document.getElementById('chat-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'chat-auth-modal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
      <div class="chat-modal-content">
        <button class="chat-modal-close" id="chat-modal-close">✕</button>
        <div class="chat-modal-header">
          <span class="chat-modal-title">✦ welcome to chat</span>
        </div>
        <div class="chat-modal-tabs">
          <button class="chat-tab active" data-tab="login">login</button>
          <button class="chat-tab" data-tab="signup">sign up</button>
        </div>
        <div class="chat-modal-body">
          <div id="chat-login-form" class="chat-form active">
            <p class="chat-modal-desc">Login to join the chat</p>
            <input type="text" id="chat-login-username" class="chat-modal-input" placeholder="username" />
            <input type="password" id="chat-login-password" class="chat-modal-input" placeholder="password" />
            <div class="chat-modal-error" id="chat-login-error"></div>
            <button id="chat-login-btn" class="chat-modal-btn">login →</button>
          </div>
          <div id="chat-signup-form" class="chat-form">
            <p class="chat-modal-desc">Create a new account</p>
            <input type="text" id="chat-signup-username" class="chat-modal-input" placeholder="username" />
            <input type="password" id="chat-signup-password" class="chat-modal-input" placeholder="password (min 4 chars)" />
            <div class="chat-modal-error" id="chat-signup-error"></div>
            <button id="chat-signup-btn" class="chat-modal-btn">create account →</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('chat-modal-close').addEventListener('click', () => {
      this.closeAuthModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeAuthModal();
      }
    });

    document.addEventListener('keydown', this.handleEscKey = (e) => {
      if (e.key === 'Escape' && document.getElementById('chat-auth-modal')) {
        this.closeAuthModal();
      }
    });

    document.querySelectorAll('.chat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.chat-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`chat-${tabName}-form`).classList.add('active');
        
        document.querySelectorAll('.chat-modal-error').forEach(el => {
          el.textContent = '';
          el.className = 'chat-modal-error';
        });
      });
    });

    document.getElementById('chat-login-btn').addEventListener('click', () => this.handleLogin());
    document.getElementById('chat-login-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    document.getElementById('chat-signup-btn').addEventListener('click', () => this.handleSignup());
    document.getElementById('chat-signup-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSignup();
    });

    setTimeout(() => {
      const firstInput = document.querySelector('.chat-form.active input');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  closeAuthModal() {
    const modal = document.getElementById('chat-auth-modal');
    if (modal) {
      modal.classList.add('fade-out');
      setTimeout(() => {
        modal.remove();
        if (this.handleEscKey) {
          document.removeEventListener('keydown', this.handleEscKey);
        }
        const body = document.getElementById('chat-body');
        const arrow = document.querySelector('.chat-toggle-arrow');
        if (body) {
          body.classList.remove('open');
          this.isChatOpen = false;
          if (arrow) arrow.textContent = '▸';
        }
      }, 300);
    }
  }

  async handleLogin() {
    const username = document.getElementById('chat-login-username').value.trim();
    const password = document.getElementById('chat-login-password').value.trim();
    const errorEl = document.getElementById('chat-login-error');

    if (!username || !password) {
      errorEl.textContent = '⚠️ Please enter username and password';
      return;
    }

    errorEl.textContent = '';

    try {
      const response = await fetch('https://api.wxrn.lol/chat/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = `⚠️ ${data.error || 'Login failed'}`;
        return;
      }

      this.username = data.username;
      this.isAuthenticated = true;
      localStorage.setItem('chat_username', data.username);
      localStorage.setItem('chat_avatar_color', data.avatarColor || '#9f4ac6');

      const modal = document.getElementById('chat-auth-modal');
      modal.classList.add('fade-out');
      setTimeout(() => modal.remove(), 300);

      this.connect();
      this.showNotification('✅ Logged in successfully!', 'success');

    } catch (error) {
      errorEl.textContent = '⚠️ Connection error. Please try again.';
      console.error('Login error:', error);
    }
  }

  async handleSignup() {
    const username = document.getElementById('chat-signup-username').value.trim();
    const password = document.getElementById('chat-signup-password').value.trim();
    const errorEl = document.getElementById('chat-signup-error');

    if (!username || !password) {
      errorEl.textContent = '⚠️ Please enter username and password';
      return;
    }

    if (password.length < 4) {
      errorEl.textContent = '⚠️ Password must be at least 4 characters';
      return;
    }

    if (!/^[a-zA-Z0-9_\s]{2,20}$/.test(username)) {
      errorEl.textContent = '⚠️ Use 2-20 characters, letters, numbers, spaces, underscores';
      return;
    }

    errorEl.textContent = '';

    try {
      const response = await fetch('https://api.wxrn.lol/chat/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = `⚠️ ${data.error || 'Signup failed'}`;
        return;
      }

      document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="login"]').classList.add('active');
      document.querySelectorAll('.chat-form').forEach(f => f.classList.remove('active'));
      document.getElementById('chat-login-form').classList.add('active');

      document.getElementById('chat-login-username').value = username;
      document.getElementById('chat-login-password').value = '';
      document.getElementById('chat-login-password').focus();

      errorEl.textContent = '✅ Account created! Login below.';
      errorEl.style.color = '#4ade80';

    } catch (error) {
      errorEl.textContent = '⚠️ Connection error. Please try again.';
      console.error('Signup error:', error);
    }
  }

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  connect() {
    if (!this.isAuthenticated) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://api.wxrn.lol/chat/ws?username=${encodeURIComponent(this.username)}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🟢 Connected to chat');
        this.isConnected = true;
        this.useHttpFallback = false;
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
        this.enableInput(true);
        this.showNotification('Connected to chat', 'success');
        this.flushMessageQueue();
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
        this.useHttpFallback = true;
        this.showNotification('Using HTTP fallback for messages', 'info');
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      this.useHttpFallback = true;
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.showNotification('Connection lost. Using HTTP fallback.', 'error');
      this.useHttpFallback = true;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000);
    
    console.log(`Reconnecting in ${delay/1000}s... (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  handleMessage(data) {
    try {
      const parsed = JSON.parse(data);
      
      switch (parsed.type) {
        case 'history':
          console.log('📜 Received history from WebSocket:', parsed.data.length, 'messages');
          this.messages = parsed.data;
          this.renderMessages();
          break;
          
        case 'new_message':
          console.log('📩 New message:', parsed.data);
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
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    console.log('📤 Sending message:', message);
    
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        message: message
      }));
      input.value = '';
      this.isTyping = false;
      clearTimeout(this.typingTimeout);
      console.log('✅ Message sent via WebSocket');
      return;
    }

    if (this.useHttpFallback || !this.isConnected) {
      console.log('📤 Using HTTP fallback for message');
      this.sendMessageHttp(message);
      input.value = '';
      this.isTyping = false;
      clearTimeout(this.typingTimeout);
      return;
    }

    this.messageQueue.push(message);
    this.showNotification('Message queued. Will send when connected.', 'info');
    input.value = '';
  }

  async sendMessageHttp(message) {
    try {
      console.log('📤 Sending HTTP message:', message);
      const response = await fetch('https://api.wxrn.lol/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          message: message
        })
      });

      console.log('HTTP response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        this.messages.push(data);
        this.renderMessages();
        this.showNotification('Message sent ✓', 'success');
        console.log('✅ Message sent via HTTP');
      } else {
        const error = await response.json();
        console.error('HTTP send error:', error);
        this.showNotification(`Failed to send: ${error.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('HTTP send error:', error);
      this.showNotification('Failed to send message', 'error');
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'message',
          message: message
        }));
      }
    }
  }

  // ============================================
  // UI UPDATE METHODS
  // ============================================

  handleTyping() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    
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
    if (!container) {
      console.warn('📜 Chat container not found');
      return;
    }

    console.log('📜 Rendering', this.messages.length, 'messages');
    
    // Clear container
    container.innerHTML = '';
    
    if (this.messages.length === 0) {
      container.innerHTML = '<div class="chat-message system"><span class="chat-msg-system">No messages yet. Be the first!</span></div>';
      return;
    }
    
    // Render all messages
    this.messages.forEach(msg => {
      container.appendChild(this.createMessageElement(msg));
    });
    
    this.scrollToBottom();
    console.log('✅ Messages rendered');
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
    if (input) {
      input.disabled = !enabled;
      input.placeholder = enabled ? 'Type a message...' : 'Connecting...';
    }
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
      console.log('📜 Loading chat history...');
      const response = await fetch('https://api.wxrn.lol/chat/history?limit=50');
      if (response.ok) {
        const data = await response.json();
        console.log('📜 History loaded:', data.messages?.length || 0, 'messages');
        this.messages = data.messages || [];
        this.users = data.users || [];
        this.historyLoaded = true;
        
        this.renderMessages();
        this.updateUserCount();
        
        console.log('✅ History loaded and rendered');
      } else {
        console.error('Failed to load history:', response.status);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📋 DOM loaded, initializing chat...');
  setTimeout(() => {
    window.chatClient = new ChatClient();
  }, 1500);
});
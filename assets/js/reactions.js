// reactions.js - Floating reaction button with hover popup

class ReactionSystem {
  constructor() {
    this.reactions = [];
    this.total = 0;
    this.userReactions = [];
    this.isLoaded = false;
    this.isHovering = false;
    this.popupTimeout = null;
    this.feedbackTimeout = null;
    this.ip = null;
    this.domain = null;
    this.isApiAvailable = true;
    
    this.init();
  }

  init() {
    this.getUserInfo();
    this.createUI();
    // Wait a bit before loading reactions
    setTimeout(() => {
      this.loadReactions();
    }, 2000);
    this.setupEventListeners();
  }

  getUserInfo() {
    this.ip = localStorage.getItem('user_ip');
    this.domain = window.location.hostname || '127.0.0.1';
    
    if (!this.ip) {
      fetch('https://api.ipify.org/?format=json')
        .then(r => r.json())
        .then(data => {
          this.ip = data.ip;
          localStorage.setItem('user_ip', this.ip);
        })
        .catch(() => {});
    }
  }

  createUI() {
    if (document.getElementById('reaction-container')) return;

    const reactionHTML = `
      <div id="reaction-container" class="reaction-container">
        <div class="reaction-fab" id="reaction-fab">
          <span class="fab-icon">❤️</span>
          <span class="fab-total" id="fab-total">0</span>
        </div>
        <div class="reaction-popup" id="reaction-popup">
          <div class="reaction-popup-header">
            <span class="popup-title">✦ react</span>
            <button class="popup-close" id="popup-close">✕</button>
          </div>
          <div class="reaction-grid" id="reaction-grid">
            <button class="reaction-btn" data-emoji="💀">
              💀 <span class="reaction-count" id="reaction-💀">0</span>
            </button>
            <button class="reaction-btn" data-emoji="😢">
              😢 <span class="reaction-count" id="reaction-😢">0</span>
            </button>
            <button class="reaction-btn" data-emoji="❤️">
              ❤️ <span class="reaction-count" id="reaction-❤️">0</span>
            </button>
            <button class="reaction-btn" data-emoji="🔥">
              🔥 <span class="reaction-count" id="reaction-🔥">0</span>
            </button>
            <button class="reaction-btn" data-emoji="✨">
              ✨ <span class="reaction-count" id="reaction-✨">0</span>
            </button>
            <button class="reaction-btn" data-emoji="👀">
              👀 <span class="reaction-count" id="reaction-👀">0</span>
            </button>
            <button class="reaction-btn" data-emoji="🎵">
              🎵 <span class="reaction-count" id="reaction-🎵">0</span>
            </button>
            <button class="reaction-btn" data-emoji="💯">
              💯 <span class="reaction-count" id="reaction-💯">0</span>
            </button>
            <button class="reaction-btn" data-emoji="🌟">
              🌟 <span class="reaction-count" id="reaction-🌟">0</span>
            </button>
            <button class="reaction-btn" data-emoji="⚡">
              ⚡ <span class="reaction-count" id="reaction-⚡">0</span>
            </button>
            <button class="reaction-btn" data-emoji="🤝">
              🤝 <span class="reaction-count" id="reaction-🤝">0</span>
            </button>
            <button class="reaction-btn" data-emoji="🎨">
              🎨 <span class="reaction-count" id="reaction-🎨">0</span>
            </button>
          </div>
          <div class="reaction-feedback" id="reaction-feedback"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', reactionHTML);
  }

  setupEventListeners() {
    const fab = document.getElementById('reaction-fab');
    const popup = document.getElementById('reaction-popup');
    const closeBtn = document.getElementById('popup-close');

    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePopup();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closePopup();
      });
    }

    document.addEventListener('click', (e) => {
      const container = document.getElementById('reaction-container');
      if (container && !container.contains(e.target)) {
        this.closePopup();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePopup();
      }
    });

    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const emoji = btn.dataset.emoji;
        await this.toggleReaction(emoji);
      });
    });

    fab.addEventListener('mouseenter', () => {
      this.isHovering = true;
      clearTimeout(this.popupTimeout);
    });

    fab.addEventListener('mouseleave', () => {
      this.isHovering = false;
      clearTimeout(this.popupTimeout);
    });
  }

  togglePopup() {
    const popup = document.getElementById('reaction-popup');
    if (!popup) return;
    
    popup.classList.toggle('open');
    if (popup.classList.contains('open') && this.isApiAvailable) {
      this.loadReactions();
    }
  }

  closePopup() {
    const popup = document.getElementById('reaction-popup');
    if (popup) {
      popup.classList.remove('open');
    }
  }

  async loadReactions() {
    try {
      const response = await fetch('https://api.wxrn.lol/reactions');
      if (response.ok) {
        const data = await response.json();
        this.reactions = data.reactions || [];
        this.total = data.total || 0;
        this.updateDisplay();
        this.isLoaded = true;
        this.isApiAvailable = true;
      } else if (response.status === 404) {
        console.warn('Reactions API not available');
        this.isApiAvailable = false;
        this.showFeedback('Reactions coming soon', 'info');
      }
    } catch (error) {
      console.error('Failed to load reactions:', error);
      this.isApiAvailable = false;
    }

    // Load user's reactions
    if (this.isApiAvailable) {
      try {
        const response = await fetch('https://api.wxrn.lol/reactions/my');
        if (response.ok) {
          const data = await response.json();
          this.userReactions = data.emojis || [];
          this.updateButtonStates();
        }
      } catch (error) {
        console.error('Failed to load user reactions:', error);
      }
    }
  }

  async toggleReaction(emoji) {
    if (!this.isApiAvailable) {
      this.showFeedback('⚠️ Reactions unavailable', 'error');
      return;
    }

    try {
      const response = await fetch('https://api.wxrn.lol/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const data = await response.json();
        this.reactions = data.reactions || [];
        this.total = data.total || 0;
        
        if (data.added) {
          this.userReactions.push(emoji);
          this.showFeedback(`+1 ${emoji}`, 'added');
          const btn = document.querySelector(`[data-emoji="${emoji}"]`);
          if (btn) {
            btn.classList.add('pulse');
            setTimeout(() => btn.classList.remove('pulse'), 400);
          }
        } else if (data.removed) {
          this.userReactions = this.userReactions.filter(e => e !== emoji);
          this.showFeedback(`↺ ${emoji}`, 'removed');
        }
        
        this.updateDisplay();
        this.updateButtonStates();
        this.updateFabTotal();
      } else {
        const error = await response.json();
        this.showFeedback(`⚠️ ${error.error || 'Error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      this.showFeedback('⚠️ Try again', 'error');
    }
  }

  updateDisplay() {
    this.reactions.forEach(r => {
      const countEl = document.getElementById(`reaction-${r.emoji}`);
      if (countEl) {
        countEl.textContent = r.count;
      }
    });

    const allEmojis = ['💀', '😢', '❤️', '🔥', '✨', '👀', '🎵', '💯', '🌟', '⚡', '🤝', '🎨'];
    allEmojis.forEach(emoji => {
      const countEl = document.getElementById(`reaction-${emoji}`);
      if (countEl) {
        const found = this.reactions.find(r => r.emoji === emoji);
        countEl.textContent = found ? found.count : 0;
      }
    });

    this.updateFabTotal();
  }

  updateFabTotal() {
    const totalEl = document.getElementById('fab-total');
    if (totalEl) {
      totalEl.textContent = this.total;
    }
  }

  updateButtonStates() {
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      const emoji = btn.dataset.emoji;
      if (this.userReactions.includes(emoji)) {
        btn.classList.add('reacted');
      } else {
        btn.classList.remove('reacted');
      }
    });
  }

  showFeedback(message, type = 'info') {
    const feedback = document.getElementById('reaction-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = `reaction-feedback ${type}`;
    feedback.style.opacity = '1';
    
    clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => {
      feedback.style.opacity = '0';
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const checkInterval = setInterval(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen || loadingScreen.style.display === 'none') {
      clearInterval(checkInterval);
      setTimeout(() => {
        window.reactionSystem = new ReactionSystem();
      }, 1000);
    }
  }, 500);
});
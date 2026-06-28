// inspect.js - Enhanced anti-inspect with persistent warning (SIMPLIFIED)

(function() {
  'use strict';

  // ============================================
  // LAYER 1: Keyboard Shortcuts
  // ============================================

  document.addEventListener("keydown", (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+K (Web Console - Firefox)
    if (e.ctrlKey && e.shiftKey && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+Shift+S (Save Page As - Firefox)
    if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+A (Search - Chrome)
    if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.keyCode === 65)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Ctrl+P (Print)
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // ============================================
  // LAYER 2: Context Menu
  // ============================================

  document.addEventListener("contextmenu", (e) => {
    const contextMenu = document.getElementById('right-click-menu');
    if (contextMenu && contextMenu.contains(e.target)) {
      return;
    }
    e.preventDefault();
    return false;
  });

  // ============================================
  // LAYER 3: Drag Prevention
  // ============================================

  document.querySelectorAll("img, .friend-block, .social-btn, button, a").forEach(function (el) {
    el.setAttribute("draggable", "false");
  });
  
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  });

  // ============================================
  // LAYER 4: Block View Source
  // ============================================

  // Block view-source protocol
  if (window.location.protocol === 'view-source:') {
    window.location.href = window.location.href.replace('view-source:', '');
  }

  // Block view source via beforeunload
  window.addEventListener('beforeunload', function(e) {
    if (document.referrer && document.referrer.includes('view-source:')) {
      window.location.href = window.location.href;
    }
  });

  // Block view-source links
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && target.href && target.href.includes('view-source:')) {
      e.preventDefault();
      return false;
    }
  });

  // Override window.open to block view-source
  const originalOpen = window.open;
  window.open = function(url, name, features) {
    if (url && typeof url === 'string' && url.includes('view-source:')) {
      return null;
    }
    if (name === '_blank' && features && features.includes('devtools')) {
      return null;
    }
    return originalOpen.call(this, url, name, features);
  };

  // ============================================
  // LAYER 5: DevTools Detection
  // ============================================

  let devtoolsDetected = false;
  let warningOverlay = null;
  let detectionCount = 0;
  let isInitialCheck = true;

  function createWarningOverlay() {
    if (warningOverlay) return warningOverlay;
    
    const overlay = document.createElement('div');
    overlay.id = 'devtools-warning';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.92);
      color: #fff;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-family: monospace;
      z-index: 999999;
      flex-direction: column;
      gap: 16px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.02);
    `;
    overlay.innerHTML = `
      <div style="font-size: 48px; color: var(--accent-color, #9f4ac6); margin-bottom: 4px;">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <div style="font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">
        Developer Tools Detected
      </div>
      <div style="font-size: 13px; color: rgba(255,255,255,0.2); font-weight: 300; letter-spacing: 0.5px;">
        Close DevTools to continue
      </div>
      <div style="font-size: 11px; color: rgba(255,255,255,0.08); margin-top: 4px; letter-spacing: 0.5px;">
        <i class="fa-regular fa-keyboard"></i> F12 · Ctrl+Shift+I
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        #devtools-warning {
          animation: fadeIn 0.3s ease;
        }
        #devtools-warning i {
          animation: pulse-icon 2s ease-in-out infinite;
        }
        @keyframes pulse-icon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      </style>
    `;
    
    document.body.appendChild(overlay);
    warningOverlay = overlay;
    return overlay;
  }

  function showWarning() {
    const overlay = createWarningOverlay();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideWarning() {
    if (warningOverlay) {
      warningOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // ============================================
  // LAYER 6: Reliable DevTools detection
  // ============================================

  function detectDevTools() {
    // Method 1: Check window size difference (most reliable)
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    const WIDTH_THRESHOLD = 150;
    const HEIGHT_THRESHOLD = 150;
    
    if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
      return true;
    }
    
    // Method 2: Check for debugger statement
    try {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const endTime = performance.now();
      if ((endTime - startTime) > 50) {
        return true;
      }
    } catch (e) {}
    
    // Method 3: Check for DevTools specific properties
    try {
      if (window.devtools && window.devtools.open) {
        return true;
      }
    } catch (e) {}
    
    // Method 4: Check for Firebug
    try {
      if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
        return true;
      }
    } catch (e) {}
    
    return false;
  }

  // ============================================
  // LAYER 7: Persistent DevTools Monitoring
  // ============================================

  let warningShown = false;

  function checkDevTools() {
    if (isInitialCheck) {
      isInitialCheck = false;
      setTimeout(checkDevTools, 1000);
      return;
    }
    
    const isOpen = detectDevTools();
    
    if (isOpen) {
      detectionCount++;
      if (detectionCount >= 2) {
        if (!warningShown) {
          warningShown = true;
          console.clear();
          showWarning();
        }
      }
    } else {
      detectionCount = 0;
      if (warningShown) {
        warningShown = false;
        hideWarning();
      }
    }
  }

  // ============================================
  // LAYER 8: Override Console Methods
  // ============================================

  if (typeof console !== 'undefined') {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    const allowConsole = false;
    
    if (!allowConsole) {
      console.log = function() {};
      console.warn = function() {};
      console.error = function() {};
      console.info = function() {};
      console.debug = function() {};
    }
    
    window.__devConsole = originalConsole;
  }

  // ============================================
  // LAYER 9: Prevent Selection
  // ============================================

  document.addEventListener('selectstart', function(e) {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') {
      return;
    }
    e.preventDefault();
    return false;
  });

  // ============================================
  // LAYER 10: Disable Right-Click on Images
  // ============================================

  document.addEventListener('mousedown', function(e) {
    if (e.button === 2) {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'img' || tag === 'canvas' || tag === 'video') {
        e.preventDefault();
        return false;
      }
    }
  });

  // ============================================
  // LAYER 11: Initialize
  // ============================================

  window.addEventListener('load', function() {
    setTimeout(checkDevTools, 1500);
  });

  setInterval(checkDevTools, 1000);

  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(checkDevTools, 300);
  });

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      setTimeout(checkDevTools, 500);
    }
  });

  console.log('Enhanced protection enabled');
})();
// inspect.js - Enhanced anti-inspect with persistent warning (FIXED)

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
  // LAYER 4: DevTools Detection - IMPROVED
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
      background: rgba(0, 0, 0, 0.95);
      color: #ff4444;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-family: monospace;
      z-index: 999999;
      flex-direction: column;
      gap: 20px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    `;
    overlay.innerHTML = `
      <div style="font-size: 64px; animation: pulse 1.5s ease-in-out infinite;">🔒</div>
      <div style="font-weight: bold; letter-spacing: 2px;">DEVELOPER TOOLS DETECTED</div>
      <div style="font-size: 16px; color: rgba(255,255,255,0.4);">Please close DevTools to continue</div>
      <div style="font-size: 14px; color: rgba(255,255,255,0.15); margin-top: 10px;">Press F12 or Ctrl+Shift+I to close</div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
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
  // IMPROVED: More reliable DevTools detection
  // ============================================

  function detectDevTools() {
    // Only check if we're not in a false-positive state
    // Use multiple methods with higher thresholds
    
    // Method 1: Check window size difference (most reliable)
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    // Higher thresholds to avoid false positives
    // Normal browser UI typically adds 0-50px difference
    // DevTools adds 200+px difference
    const WIDTH_THRESHOLD = 150;
    const HEIGHT_THRESHOLD = 150;
    
    if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
      return true;
    }
    
    // Method 2: Check for debugger statement (very reliable)
    try {
      const start = performance.now();
      // Use a more reliable debugger check
      const isDebugger = (function() {
        let result = false;
        try {
          // This will trigger the debugger if DevTools is open
          const test = new Function('debugger;');
          test();
        } catch (e) {
          result = true;
        }
        return result;
      })();
      
      // Actually, let's use a simpler approach
      const debuggerCheck = function() {
        const startTime = performance.now();
        let endTime = startTime;
        try {
          // eslint-disable-next-line no-debugger
          debugger;
          endTime = performance.now();
        } catch (e) {
          endTime = performance.now();
        }
        return (endTime - startTime) > 50;
      };
      
      if (debuggerCheck()) {
        return true;
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Method 3: Check for DevTools specific properties (Chrome)
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
    
    // Method 5: Check for devtools in iframe (less reliable)
    try {
      const devtoolsElement = document.createElement('div');
      devtoolsElement.id = '__devtools_element';
      devtoolsElement.style.display = 'block';
      devtoolsElement.style.position = 'absolute';
      devtoolsElement.style.left = '-100000px';
      devtoolsElement.style.top = '-100000px';
      devtoolsElement.style.width = '100px';
      devtoolsElement.style.height = '100px';
      document.body.appendChild(devtoolsElement);
      
      // Check if element size changed (indicates DevTools)
      const rect = devtoolsElement.getBoundingClientRect();
      const detected = rect.width !== 100 || rect.height !== 100;
      
      document.body.removeChild(devtoolsElement);
      
      if (detected) {
        return true;
      }
    } catch (e) {}
    
    return false;
  }

  // ============================================
  // LAYER 5: Persistent DevTools Monitoring
  // ============================================

  let warningShown = false;

  function checkDevTools() {
    // Skip initial check to avoid false positives on load
    if (isInitialCheck) {
      isInitialCheck = false;
      setTimeout(checkDevTools, 1000);
      return;
    }
    
    const isOpen = detectDevTools();
    
    // Add some debouncing to prevent flickering
    if (isOpen) {
      detectionCount++;
      // Require 2 consecutive detections to trigger warning
      if (detectionCount >= 2) {
        if (!warningShown) {
          warningShown = true;
          console.clear();
          console.log('%c🔒 Developer tools detected!', 'color: #ff4444; font-size: 20px; font-weight: bold;');
          console.log('%cPlease close DevTools to continue.', 'color: #ffaa00; font-size: 14px;');
          showWarning();
        }
      }
    } else {
      detectionCount = 0;
      if (warningShown) {
        warningShown = false;
        hideWarning();
        console.log('%c✅ DevTools closed. Welcome back!', 'color: #4ade80; font-size: 16px; font-weight: bold;');
      }
    }
  }

  // Wait for page to fully load before starting detection
  window.addEventListener('load', function() {
    setTimeout(checkDevTools, 1500);
  });

  // Check periodically (less frequently to reduce false positives)
  setInterval(checkDevTools, 1000);

  // Check on window resize with debouncing
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(checkDevTools, 300);
  });

  // Check on focus
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      setTimeout(checkDevTools, 500);
    }
  });

  // ============================================
  // LAYER 6: Override Console Methods
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
  // LAYER 7: Prevent Selection
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
  // LAYER 8: Disable Right-Click on Images
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
  // LAYER 9: Block additional shortcuts
  // ============================================

  document.addEventListener('keydown', function(e) {
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
    
    // Ctrl+Shift+P (Print - Firefox)
    if (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
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
  });

  // ============================================
  // LAYER 10: Block View Source
  // ============================================

  if (window.location.protocol === 'view-source:') {
    window.location.href = window.location.href.replace('view-source:', '');
  }

  // ============================================
  // LAYER 11: Disable DevTools via window.open
  // ============================================

  const originalOpen = window.open;
  window.open = function(url, name, features) {
    if (name === '_blank' && features && features.includes('devtools')) {
      return null;
    }
    return originalOpen.call(this, url, name, features);
  };

  console.log('Enhanced protection enabled with improved DevTools detection');
})();
// inspect.js - Enhanced anti-inspect element with multiple layers of protection

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
  });

  // ============================================
  // LAYER 2: Context Menu
  // ============================================

  document.addEventListener("contextmenu", (e) => {
    // Allow our custom context menu
    const contextMenu = document.getElementById('right-click-menu');
    if (contextMenu && contextMenu.contains(e.target)) {
      return;
    }
    // Prevent default for everything else
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
  // LAYER 4: Console Detection & Prevention
  // ============================================

  // Detect if DevTools is open using various methods
  function detectDevTools() {
    // Method 1: Check element size (DevTools elements panel)
    const devtoolsElement = document.createElement('div');
    devtoolsElement.id = '__devtools_element';
    devtoolsElement.style.display = 'block';
    devtoolsElement.style.position = 'absolute';
    devtoolsElement.style.left = '-100000px';
    devtoolsElement.style.top = '-100000px';
    devtoolsElement.style.width = '100px';
    devtoolsElement.style.height = '100px';
    document.body.appendChild(devtoolsElement);
    
    // Method 2: Check console logging (DevTools console)
    const consoleCheck = /./;
    consoleCheck.toString = function() {
      return 'devtools-check';
    };
    
    // Method 3: Check for debugger statement
    const debuggerCheck = function() {
      const start = performance.now();
      debugger;
      const end = performance.now();
      return (end - start) > 100;
    };
    
    // Method 4: Check window size difference (DevTools sidebar)
    const widthDiff = window.outerWidth - window.innerWidth > 160;
    const heightDiff = window.outerHeight - window.innerHeight > 160;
    
    // Method 5: Check for DevTools specific properties
    const devtoolsOpen = !!(window.devtools && window.devtools.open);
    
    // Clean up
    document.body.removeChild(devtoolsElement);
    
    return widthDiff || heightDiff || devtoolsOpen || debuggerCheck();
  }

  // Check for DevTools periodically
  let devtoolsDetected = false;
  
  setInterval(function() {
    if (detectDevTools()) {
      if (!devtoolsDetected) {
        devtoolsDetected = true;
        console.clear();
        console.log('%c🔒 Developer tools detected!', 'color: #ff4444; font-size: 20px; font-weight: bold;');
        console.log('%cPlease close DevTools for the best experience.', 'color: #ffaa00; font-size: 14px;');
        // Optionally redirect or show a message
        // window.location.href = 'about:blank'; // Uncomment to redirect
      }
    } else {
      devtoolsDetected = false;
    }
  }, 2000);

  // ============================================
  // LAYER 5: Override Console Methods
  // ============================================

  // Override console methods to prevent easy logging
  if (typeof console !== 'undefined') {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    // Only allow console in production if needed
    const allowConsole = false; // Set to false to disable console completely
    
    if (!allowConsole) {
      console.log = function() {};
      console.warn = function() {};
      console.error = function() {};
      console.info = function() {};
      console.debug = function() {};
    }
    
    // But keep error logging for debugging (can be toggled)
    window.__devConsole = originalConsole;
  }

  // ============================================
  // LAYER 6: Prevent Selection (User Select)
  // ============================================

  document.addEventListener('selectstart', function(e) {
    // Allow selection in specific elements (like inputs)
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') {
      return;
    }
    e.preventDefault();
    return false;
  });

  // ============================================
  // LAYER 7: Disable Right-Click on Images
  // ============================================

  document.addEventListener('mousedown', function(e) {
    if (e.button === 2) { // Right mouse button
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'img' || tag === 'canvas' || tag === 'video') {
        e.preventDefault();
        return false;
      }
    }
  });

  // ============================================
  // LAYER 8: Keyboard Shortcut Override (Ctrl+S, etc.)
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
  });

  if (window.location.protocol === 'view-source:') {
    window.location.href = window.location.href.replace('view-source:', '');
  }

  console.log('🔒 Enhanced protection enabled');
})();
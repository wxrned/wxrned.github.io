// click.js - Complete working right-click menu with anti-inspect

document.addEventListener("DOMContentLoaded", () => {
  const contextMenu = document.getElementById("right-click-menu");
  const themeSwitcher = document.querySelector("#theme-switcher");
  const refreshPageBtn = document.getElementById("refresh-page");
  const toggleMusicBtn = document.querySelector("#toggle-music");
  const copyUrlBtn = document.getElementById("copy-url");
  const musicPlayer = document.querySelector(".music-player");
  const tweetBtn = document.getElementById("tweet-button");
  const tweetModal = document.getElementById("tweet-modal");
  const closeTweetModal = document.getElementById("close-tweet-modal");
  const body = document.body;

  // Add new menu items
  const menuItems = [
    { id: 'refresh-page', icon: 'fa-rotate-right', text: 'Refresh Page' },
    { id: 'toggle-music', icon: 'fa-music', text: 'Toggle Player' },
    { id: 'copy-url', icon: 'fa-copy', text: 'Copy URL' },
    { id: 'fullscreen', icon: 'fa-expand', text: 'Fullscreen' },
    { id: 'screenshot', icon: 'fa-camera', text: 'Screenshot' },
    { id: 'share-page', icon: 'fa-share-alt', text: 'Share Page' },
  ];

  // Rebuild menu with new items
  const menuList = contextMenu.querySelector('ul');
  if (menuList) {
    menuList.innerHTML = '';
    menuItems.forEach(item => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.id = item.id;
      button.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.text}`;
      li.appendChild(button);
      menuList.appendChild(li);
    });
    
    // Add separator and API link
    const separator = document.createElement('li');
    separator.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    separator.style.margin = '5px 0';
    separator.style.padding = '0';
    separator.style.cursor = 'default';
    separator.style.pointerEvents = 'none';
    menuList.appendChild(separator);

    const apiLi = document.createElement('li');
    apiLi.style.padding = '5px 20px';
    apiLi.innerHTML = `<a href="https://api.wxrn.lol" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-server"></i> Powered by api.wxrn.lol</a>`;
    menuList.appendChild(apiLi);
  }

  // ============================================
  // MENU FUNCTIONALITY
  // ============================================

  // Refresh Page
  document.getElementById('refresh-page')?.addEventListener('click', () => {
    location.reload();
  });

  // Toggle Music Player
  document.getElementById('toggle-music')?.addEventListener('click', () => {
    if (!musicPlayer) return;
    if (musicPlayer.style.display === 'none' || getComputedStyle(musicPlayer).display === 'none') {
      musicPlayer.style.display = 'flex';
      if (typeof audioPlayer !== 'undefined' && audioPlayer) {
        audioPlayer.play();
        if (typeof playPauseBtn !== 'undefined' && playPauseBtn) {
          playPauseBtn.innerHTML = '<i class="icon fa-solid fa-pause"></i>';
        }
        if (typeof footer !== 'undefined' && footer && typeof tracks !== 'undefined' && typeof currentTrack !== 'undefined') {
          footer.textContent = `𐕣 ${tracks[currentTrack].title} 𐕣`;
          footer.classList.remove('slide-in-right', 'slide-in-left');
          void footer.offsetWidth;
          footer.classList.add('slide-in-right');
        }
      }
    } else {
      musicPlayer.style.display = 'none';
      if (typeof audioPlayer !== 'undefined' && audioPlayer) {
        audioPlayer.pause();
        if (typeof playPauseBtn !== 'undefined' && playPauseBtn) {
          playPauseBtn.innerHTML = '<i class="icon fa-solid fa-play"></i>';
        }
        if (typeof showDefaultFooter === 'function') {
          showDefaultFooter('slide-in-right');
        }
      }
    }
    contextMenu.style.display = 'none';
  });

  // Copy URL
  document.getElementById('copy-url')?.addEventListener('click', () => {
    let copyNotification = document.querySelector('.copy-notification');
    if (!copyNotification) {
      copyNotification = document.createElement('div');
      copyNotification.className = 'copy-notification';
      document.body.appendChild(copyNotification);
    }

    function showCopyNotification(message) {
      copyNotification.textContent = message;
      copyNotification.classList.add('show');
      setTimeout(() => {
        copyNotification.classList.remove('show');
      }, 3000);
    }

    navigator.clipboard.writeText(window.location.href)
      .then(() => showCopyNotification('URL copied!'))
      .catch(() => showCopyNotification('Failed to copy URL'));
    contextMenu.style.display = 'none';
  });

  // Fullscreen
  document.getElementById('fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    contextMenu.style.display = 'none';
  });

  // Screenshot (using html2canvas if available)
  document.getElementById('screenshot')?.addEventListener('click', () => {
    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
      // Load it dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = takeScreenshot;
      document.head.appendChild(script);
    } else {
      takeScreenshot();
    }
    contextMenu.style.display = 'none';
  });

  function takeScreenshot() {
    if (typeof html2canvas === 'undefined') {
      showCopyNotification('Screenshot library not loaded');
      return;
    }
    html2canvas(document.body, {
      scale: 0.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: getComputedStyle(document.body).backgroundColor || '#0a0a0a'
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showCopyNotification('Screenshot saved!');
    }).catch(() => {
      showCopyNotification('Failed to take screenshot');
    });
  }

  // Share Page
  document.getElementById('share-page')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => showCopyNotification('URL copied for sharing!'))
        .catch(() => showCopyNotification('Failed to share'));
    }
    contextMenu.style.display = 'none';
  });

  // ============================================
  // CONTEXT MENU EVENTS
  // ============================================

  document.addEventListener("contextmenu", (e) => {
    const entryOverlay = document.getElementById("entry-overlay");
    if (entryOverlay) {
      const style = window.getComputedStyle(entryOverlay);
      if (style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity) > 0) {
        if (entryOverlay.contains(e.target)) {
          e.preventDefault();
          return;
        }
      }
    }
    e.preventDefault();
    const clickX = e.clientX;
    const clickY = e.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuW = contextMenu.offsetWidth;
    const menuH = contextMenu.offsetHeight;

    const posX = clickX + menuW > screenW ? screenW - menuW - 5 : clickX;
    const posY = clickY + menuH > screenH ? screenH - menuH - 5 : clickY;

    contextMenu.style.left = posX + "px";
    contextMenu.style.top = posY + "px";
    contextMenu.style.display = "block";
  });

  // Touch events for mobile
  let touchTimer = null;
  let touchX = 0;
  let touchY = 0;

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    touchTimer = setTimeout(() => {
      e.preventDefault();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const menuW = contextMenu.offsetWidth;
      const menuH = contextMenu.offsetHeight;

      const posX = touchX + menuW > screenW ? screenW - menuW - 5 : touchX;
      const posY = touchY + menuH > screenH ? screenH - menuH - 5 : touchY;

      contextMenu.style.left = posX + "px";
      contextMenu.style.top = posY + "px";
      contextMenu.style.display = "block";
    }, 600);
  });

  document.addEventListener("touchend", () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  });

  document.addEventListener("touchmove", () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  });

  document.addEventListener("click", (e) => {
    if (contextMenu.style.display === "block") {
      contextMenu.style.display = "none";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contextMenu.style.display === "block") {
      contextMenu.style.display = "none";
    }
  });

  // Helper for notifications
  function showCopyNotification(message) {
    let copyNotification = document.querySelector('.copy-notification');
    if (!copyNotification) {
      copyNotification = document.createElement('div');
      copyNotification.className = 'copy-notification';
      document.body.appendChild(copyNotification);
    }
    copyNotification.textContent = message;
    copyNotification.classList.add('show');
    setTimeout(() => {
      copyNotification.classList.remove('show');
    }, 3000);
  }
});
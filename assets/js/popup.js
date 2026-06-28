// popup.js - Fully updated with proper decoration handling

document.addEventListener('DOMContentLoaded', () => {
  // Get all elements
  const pfp = document.getElementById('dc-pfp');
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  const avatarDecoration = document.getElementById('avatar-decoration');
  const visualizer = document.getElementById('visualizer');
  const lyricsPopup = document.getElementById('lyrics-popup');
  const lyricsCloseBtn = document.getElementById('lyrics-close');
  const lyricsButton = document.getElementById('lyrics-button');
  const footer = document.getElementById('footer');
  const mainContent = document.querySelector('main');

  // ============================================
  // PFP CLICK - Open Friends Popup
  // ============================================
  if (pfp) {
    pfp.addEventListener('click', function () {
      // Dispatch event for friends menu
      document.dispatchEvent(new Event('popupOpened'));
      
      if (visualizer) {
        visualizer.style.display = 'none';
      }

      // Hide decoration when popup opens
      if (avatarDecoration) {
        avatarDecoration.classList.add('fade-out');
      }

      if (popup) popup.style.display = 'block';
      if (overlay) overlay.style.display = 'block';

      setTimeout(() => {
        if (popup) popup.classList.add('show');
        if (overlay) overlay.classList.add('show');
      }, 10);
    });
  }

  // ============================================
  // CLOSE FRIENDS POPUP
  // ============================================
  window.closePopup = function() {
    if (popup) popup.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    
    // Restore decoration when closing
    if (avatarDecoration) {
      avatarDecoration.classList.remove('fade-out');
    }

    if (visualizer) {
      visualizer.style.display = 'none';
    }

    setTimeout(() => {
      if (popup) popup.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
    }, 300);
  };

  // ============================================
  // LYRICS CLOSE
  // ============================================
  if (lyricsCloseBtn) {
    lyricsCloseBtn.addEventListener('click', () => {
      if (lyricsPopup) {
        lyricsPopup.classList.remove('show');
        mainContent?.classList.remove('no-click');
      }
      
      if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.remove('show');
      }
      
      // Restore decoration when closing lyrics
      if (avatarDecoration) {
        avatarDecoration.classList.remove('fade-out');
      }

      if (visualizer) {
        visualizer.style.display = 'none';
      }

      setTimeout(() => {
        if (lyricsPopup) lyricsPopup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
      }, 250);
    });
  }

  // ============================================
  // LYRICS BUTTON - OPEN
  // ============================================
  if (lyricsButton) {
    lyricsButton.addEventListener('click', () => {
      if (lyricsPopup) {
        lyricsPopup.style.display = 'block';
        lyricsPopup.classList.add('show');
      }
      
      if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('show');
      }
      
      if (mainContent) {
        mainContent.classList.add('no-click');
      }
      
      // Hide decoration when lyrics opens
      if (avatarDecoration) {
        avatarDecoration.classList.add('fade-out');
      }

      if (visualizer) {
        visualizer.style.display = 'block';
      }
    });
  }

  // ============================================
  // FOOTER CLICK - Open Lyrics
  // ============================================
  if (footer) {
    footer.addEventListener('click', () => {
      if (lyricsPopup) {
        lyricsPopup.style.display = 'block';
        lyricsPopup.classList.add('show');
      }
      
      if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('show');
      }
      
      if (mainContent) {
        mainContent.classList.add('no-click');
      }
      
      // Hide decoration when lyrics opens
      if (avatarDecoration) {
        avatarDecoration.classList.add('fade-out');
      }

      if (visualizer) {
        visualizer.style.display = 'block';
      }
    });
  }

  // ============================================
  // CLOSE ON ESCAPE KEY
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close popup if open
      if (popup && popup.classList.contains('show')) {
        window.closePopup();
      }
      
      // Close lyrics if open
      if (lyricsPopup && lyricsPopup.classList.contains('show')) {
        lyricsPopup.classList.remove('show');
        overlay?.classList.remove('show');
        mainContent?.classList.remove('no-click');
        if (avatarDecoration) {
          avatarDecoration.classList.remove('fade-out');
        }
        setTimeout(() => {
          if (lyricsPopup) lyricsPopup.style.display = 'none';
          if (overlay) overlay.style.display = 'none';
        }, 250);
      }
    }
  });

  // ============================================
  // CLICK OUTSIDE TO CLOSE
  // ============================================
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      // Close popup if overlay is clicked and popup is open
      if (popup && popup.classList.contains('show')) {
        window.closePopup();
      }
      
      // Close lyrics if overlay is clicked and lyrics is open
      if (lyricsPopup && lyricsPopup.classList.contains('show')) {
        lyricsPopup.classList.remove('show');
        overlay.classList.remove('show');
        mainContent?.classList.remove('no-click');
        if (avatarDecoration) {
          avatarDecoration.classList.remove('fade-out');
        }
        setTimeout(() => {
          if (lyricsPopup) lyricsPopup.style.display = 'none';
          if (overlay) overlay.style.display = 'none';
        }, 250);
      }
    });
  }

  // ============================================
  // STORE ORIGINAL CLOSE FUNCTION
  // ============================================
  // Keep original for compatibility
  const originalClosePopup = window.closePopup;
  
  // Make sure closePopup is always available
  if (!window.closePopup) {
    window.closePopup = function() {
      if (popup) popup.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
      if (avatarDecoration) {
        avatarDecoration.classList.remove('fade-out');
      }
      setTimeout(() => {
        if (popup) popup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
      }, 300);
    };
  }

  console.log('✅ Popup.js initialized');
});
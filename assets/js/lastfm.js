const LASTFM_USERNAME = 'RoboCookieOff';
const API_BASE = 'https://api.wxrn.lol';

let tooltipTimeout = null;
let lastFetchTime = 0;
let cachedTrack = null;
let isHovering = false;

async function fetchNowPlaying() {
  try {
    const response = await fetch(
      `${API_BASE}/social/lastfm/recent?username=${LASTFM_USERNAME}&limit=1`
    );
    
    if (!response.ok) {
      if (response.status === 500) {
        console.warn('Last.fm API returned 500 - might be misconfigured');
        return {
          name: 'Last.fm not configured',
          artist: 'Check API key',
          isNowPlaying: false,
          timeAgo: '',
          image: null,
          error: true
        };
      }
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.tracks || data.tracks.length === 0) {
      return {
        name: 'Nothing playing',
        artist: 'Check back later',
        isNowPlaying: false,
        timeAgo: '',
        image: null,
        error: false
      };
    }
    
    const track = data.tracks[0];
    const isNowPlaying = track.nowPlaying || false;
    const playedAt = track.playedAt;
    
    let timeAgo = '';
    if (playedAt) {
      const playedDate = new Date(playedAt);
      const now = new Date();
      const diffMs = now - playedDate;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (isNowPlaying) {
        timeAgo = '🎵 Currently playing';
      } else if (diffMins < 1) {
        timeAgo = 'Just now';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeAgo = `${hours}h ${diffMins % 60}m ago`;
      } else {
        const days = Math.floor(diffMins / 1440);
        timeAgo = `${days}d ago`;
      }
    }
    
    // Get album cover image - try different sizes
    let imageUrl = null;
    if (track.image) {
      imageUrl = track.image;
    } else if (track.album && track.album.image) {
      imageUrl = track.album.image;
    }
    
    // If we have an image URL, try to get a larger version
    if (imageUrl) {
      // Replace size parameter for larger image if possible
      imageUrl = imageUrl.replace(/\/\d+x\d+\//, '/300x300/');
      // Or use Last.fm's large size
      if (!imageUrl.includes('300x300')) {
        imageUrl = imageUrl.replace(/\/\d+x\d+\//, '/300x300/');
      }
    }
    
    return {
      name: track.name || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      album: track.album,
      image: imageUrl,
      isNowPlaying: isNowPlaying,
      playedAt: playedAt,
      timeAgo: timeAgo,
      error: false
    };
    
  } catch (error) {
    console.error('Failed to fetch Last.fm data:', error);
    return {
      name: 'Error loading',
      artist: 'Try again later',
      isNowPlaying: false,
      timeAgo: '',
      image: null,
      error: true
    };
  }
}

function updateTooltip(trackData) {
  const tooltip = document.getElementById('lastfm-tooltip');
  const bgEl = document.getElementById('tooltip-bg');
  const statusEl = document.getElementById('tooltip-status');
  const trackEl = document.getElementById('tooltip-track');
  const artistEl = document.getElementById('tooltip-artist');
  const timeEl = document.getElementById('tooltip-time');
  
  if (!tooltip) return;
  
  // Update background image if available
  if (bgEl && trackData && trackData.image) {
    bgEl.style.backgroundImage = `url(${trackData.image})`;
    bgEl.style.opacity = '0.2';
    bgEl.style.filter = 'blur(8px) scale(1.1)';
  } else if (bgEl) {
    bgEl.style.backgroundImage = 'none';
    bgEl.style.opacity = '0';
  }
  
  if (!trackData || trackData.error) {
    trackEl.textContent = trackData?.name || 'Nothing playing';
    artistEl.textContent = trackData?.artist || 'Check back later';
    timeEl.textContent = '';
    statusEl.textContent = '🎵';
    statusEl.className = 'tooltip-status';
    return;
  }
  
  statusEl.textContent = trackData.isNowPlaying ? '🔴' : '🎵';
  statusEl.className = 'tooltip-status' + (trackData.isNowPlaying ? ' playing' : '');
  
  trackEl.textContent = trackData.name || 'Unknown Track';
  artistEl.textContent = trackData.artist || 'Unknown Artist';
  timeEl.textContent = trackData.timeAgo || '';
  
  // Apply accent color to border
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color').trim() || '#9f4ac6';
  tooltip.style.borderColor = accentColor;
  tooltip.style.boxShadow = `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${accentColor}40`;
  
  // Update arrow color
  const style = document.getElementById('tooltip-arrow-style');
  if (!style) {
    const newStyle = document.createElement('style');
    newStyle.id = 'tooltip-arrow-style';
    newStyle.textContent = `
      .lastfm-tooltip::after {
        border-top-color: ${accentColor} !important;
      }
    `;
    document.head.appendChild(newStyle);
  }
}

function showTooltip() {
  const tooltip = document.getElementById('lastfm-tooltip');
  if (tooltip) {
    tooltip.classList.add('show');
  }
}

function hideTooltip() {
  const tooltip = document.getElementById('lastfm-tooltip');
  if (tooltip) {
    tooltip.classList.remove('show');
    // Reset background when hidden
    const bgEl = document.getElementById('tooltip-bg');
    if (bgEl) {
      bgEl.style.backgroundImage = 'none';
      bgEl.style.opacity = '0';
    }
  }
}

async function refreshNowPlaying(force = false) {
  const now = Date.now();
  
  if (!force && (now - lastFetchTime < 30000) && cachedTrack) {
    updateTooltip(cachedTrack);
    return cachedTrack;
  }
  
  // Show loading state
  const trackEl = document.getElementById('tooltip-track');
  if (trackEl) {
    trackEl.textContent = 'Loading...';
    trackEl.style.opacity = '0.6';
  }
  
  const data = await fetchNowPlaying();
  cachedTrack = data;
  lastFetchTime = now;
  
  if (trackEl) {
    trackEl.style.opacity = '1';
  }
  
  updateTooltip(data);
  return data;
}

function setupTooltip() {
  const pfp = document.getElementById('dc-pfp');
  const tooltip = document.getElementById('lastfm-tooltip');
  
  if (!pfp || !tooltip) {
    console.warn('Tooltip elements not found');
    return;
  }
  
  pfp.addEventListener('mouseenter', async () => {
    isHovering = true;
    showTooltip();
    await refreshNowPlaying();
  });
  
  pfp.addEventListener('mouseleave', () => {
    isHovering = false;
    setTimeout(() => {
      if (!isHovering) {
        hideTooltip();
      }
    }, 200);
  });
  
  tooltip.addEventListener('mouseenter', () => {
    isHovering = true;
  });
  
  tooltip.addEventListener('mouseleave', () => {
    isHovering = false;
    setTimeout(() => {
      if (!isHovering) {
        hideTooltip();
      }
    }, 200);
  });
  
  // Refresh when accent color changes
  const observer = new MutationObserver(() => {
    if (cachedTrack) {
      updateTooltip(cachedTrack);
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style']
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupTooltip, 500);
});

setInterval(() => {
  if (isHovering) {
    refreshNowPlaying(true);
  }
}, 60000);
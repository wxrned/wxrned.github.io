// assets/js/social-stats.js - Fixed with better error handling

const SOCIAL_STATS = {
  instagram: {
    icon: 'fa-instagram',
    name: 'Instagram',
    fetch: async (username) => {
      try {
        const response = await fetch(`https://api.wxrn.lol/social/instagram/${username}`);
        
        // Handle non-200 responses gracefully
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Instagram user "${username}" not found`);
            return { error: 'not_found', message: 'User not found' };
          }
          if (response.status === 500) {
            console.warn('Instagram API returned 500 - might be rate limited');
            return { error: 'rate_limited', message: 'Rate limited' };
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the response has the expected data
        if (!data || data.error) {
          console.warn('Instagram API error:', data?.error || 'Unknown error');
          return { error: 'api_error', message: data?.error || 'API error' };
        }
        
        return {
          followers: data.followers?.toLocaleString() || '0',
          following: data.following?.toLocaleString() || '0',
          posts: data.posts?.toLocaleString() || '0',
          isPrivate: data.isPrivate || false,
          isVerified: data.isVerified || false,
          fullName: data.fullName || username,
          profilePic: data.profilePic || null
        };
      } catch (error) {
        console.error('Instagram fetch error:', error.message);
        return { error: 'fetch_failed', message: error.message };
      }
    },
    format: (data) => {
      // Handle error states
      if (!data) return '<div class="tooltip-error">Failed to load stats</div>';
      
      if (data.error === 'not_found') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">📸</span>
            <span class="platform-name">Instagram</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">User not found</div>
        `;
      }
      
      if (data.error === 'rate_limited' || data.error === 'api_error') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">📸</span>
            <span class="platform-name">Instagram</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">⚠️ Temporarily unavailable</div>
        `;
      }
      
      if (data.error === 'fetch_failed') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">📸</span>
            <span class="platform-name">Instagram</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">Could not fetch stats</div>
        `;
      }
      
      // Normal data display
      return `
        <div class="tooltip-header">
          <span class="platform-icon">📸</span>
          <span class="platform-name">Instagram</span>
          <span class="platform-username">@${data.username || ''}</span>
        </div>
        ${data.fullName ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px;">${data.fullName}</div>` : ''}
        ${data.isPrivate ? '<div style="color:rgba(255,255,255,0.5);font-size:12px;">🔒 Private Account</div>' : ''}
        ${data.isVerified ? '<div style="color:#1DA1F2;font-size:12px;">✅ Verified</div>' : ''}
        <div class="stat-row">
          <span class="stat-label">👥 Followers</span>
          <span class="stat-value">${data.followers}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">👤 Following</span>
          <span class="stat-value">${data.following}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">📷 Posts</span>
          <span class="stat-value">${data.posts}</span>
        </div>
      `;
    }
  },
  
  tiktok: {
    icon: 'fa-tiktok',
    name: 'TikTok',
    fetch: async (username) => {
      try {
        const response = await fetch(`https://api.wxrn.lol/social/tiktok/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`TikTok user "${username}" not found`);
            return { error: 'not_found', message: 'User not found' };
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the response has data or is a placeholder
        if (data.message && data.message.includes('coming soon')) {
          return { 
            error: 'coming_soon', 
            message: 'Coming soon',
            followers: 'N/A',
            likes: 'N/A',
            videos: 'N/A'
          };
        }
        
        if (!data || data.error) {
          return { error: 'api_error', message: data?.error || 'API error' };
        }
        
        return {
          followers: data.followers?.toLocaleString() || '0',
          following: data.following?.toLocaleString() || '0',
          likes: data.likes?.toLocaleString() || '0',
          videos: data.videos?.toLocaleString() || '0',
          username: data.username || username
        };
      } catch (error) {
        console.error('TikTok fetch error:', error.message);
        return { error: 'fetch_failed', message: error.message };
      }
    },
    format: (data) => {
      if (!data) return '<div class="tooltip-error">Failed to load stats</div>';
      
      if (data.error === 'coming_soon') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🎵</span>
            <span class="platform-name">TikTok</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div style="color:rgba(255,255,255,0.4);font-size:12px;padding:8px 0;">⏳ Coming soon</div>
        `;
      }
      
      if (data.error === 'not_found') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🎵</span>
          <span class="platform-name">TikTok</span>
          <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">User not found</div>
        `;
      }
      
      if (data.error === 'fetch_failed' || data.error === 'api_error') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🎵</span>
            <span class="platform-name">TikTok</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">⚠️ Temporarily unavailable</div>
        `;
      }
      
      // Normal data display
      return `
        <div class="tooltip-header">
          <span class="platform-icon">🎵</span>
          <span class="platform-name">TikTok</span>
          <span class="platform-username">@${data.username || ''}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">👥 Followers</span>
          <span class="stat-value">${data.followers}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">❤️ Likes</span>
          <span class="stat-value">${data.likes}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">🎬 Videos</span>
          <span class="stat-value">${data.videos}</span>
        </div>
      `;
    }
  },
  
  lastfm: {
    icon: 'fa-lastfm',
    name: 'Last.fm',
    fetch: async (username) => {
      try {
        const response = await fetch(`https://api.wxrn.lol/social/lastfm/top-artists?username=${username}&limit=1`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Last.fm user "${username}" not found`);
            return { error: 'not_found', message: 'User not found' };
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.error) {
          return { error: 'api_error', message: data?.error || 'API error' };
        }
        
        // Get total artists
        let totalArtists = data.totalArtists || 0;
        
        // If totalArtists is not provided, try with a larger limit
        if (!totalArtists || totalArtists <= 1) {
          try {
            const fullResponse = await fetch(`https://api.wxrn.lol/social/lastfm/top-artists?username=${username}&limit=1000`);
            if (fullResponse.ok) {
              const fullData = await fullResponse.json();
              totalArtists = fullData.totalArtists || fullData.topArtists?.length || 0;
            }
          } catch (e) {
            // If the second request fails, use what we have
            console.warn('Could not fetch full artist count, using available data');
          }
        }
        
        return {
          scrobbles: data.totalScrobbles?.toLocaleString() || '0',
          artists: totalArtists || 0,
          topArtist: data.topArtists?.[0]?.name || 'N/A'
        };
      } catch (error) {
        console.error('Last.fm fetch error:', error.message);
        return { error: 'fetch_failed', message: error.message };
      }
    },
    format: (data) => {
      if (!data) return '<div class="tooltip-error">Failed to load stats</div>';
      
      if (data.error === 'not_found') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🎵</span>
            <span class="platform-name">Last.fm</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">User not found</div>
        `;
      }
      
      if (data.error === 'fetch_failed' || data.error === 'api_error') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🎵</span>
            <span class="platform-name">Last.fm</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">⚠️ Temporarily unavailable</div>
        `;
      }
      
      const artistText = data.artists === 1 ? 'artist' : 'artists';
      const formattedArtists = data.artists.toLocaleString();
      
      return `
        <div class="tooltip-header">
          <span class="platform-icon">🎵</span>
          <span class="platform-name">Last.fm</span>
          <span class="platform-username">@${data.username || ''}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">🎶 Scrobbles</span>
          <span class="stat-value">${data.scrobbles}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">🎤 Top Artist</span>
          <span class="stat-value">${data.topArtist}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">📊 ${artistText}</span>
          <span class="stat-value">${formattedArtists}</span>
        </div>
      `;
    }
  },
  
  github: {
    icon: 'fa-github',
    name: 'GitHub',
    fetch: async (username) => {
      try {
        const response = await fetch(`https://api.wxrn.lol/social/github/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`GitHub user "${username}" not found`);
            return { error: 'not_found', message: 'User not found' };
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.error) {
          return { error: 'api_error', message: data?.error || 'API error' };
        }
        
        return {
          followers: data.followers?.toLocaleString() || '0',
          following: data.following?.toLocaleString() || '0',
          repos: data.publicRepos?.toLocaleString() || '0',
          name: data.name || username,
          bio: data.bio || null,
          location: data.location || null
        };
      } catch (error) {
        console.error('GitHub fetch error:', error.message);
        return { error: 'fetch_failed', message: error.message };
      }
    },
    format: (data) => {
      if (!data) return '<div class="tooltip-error">Failed to load stats</div>';
      
      if (data.error === 'not_found') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🐙</span>
            <span class="platform-name">GitHub</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">User not found</div>
        `;
      }
      
      if (data.error === 'fetch_failed' || data.error === 'api_error') {
        return `
          <div class="tooltip-header">
            <span class="platform-icon">🐙</span>
            <span class="platform-name">GitHub</span>
            <span class="platform-username">@${data.username || ''}</span>
          </div>
          <div class="tooltip-error" style="padding:8px 0;">⚠️ Temporarily unavailable</div>
        `;
      }
      
      return `
        <div class="tooltip-header">
          <span class="platform-icon">🐙</span>
          <span class="platform-name">GitHub</span>
          <span class="platform-username">@${data.username || ''}</span>
        </div>
        ${data.name ? `<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:4px;">${data.name}</div>` : ''}
        ${data.bio ? `<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px;">${data.bio.substring(0, 50)}${data.bio.length > 50 ? '...' : ''}</div>` : ''}
        ${data.location ? `<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:4px;">📍 ${data.location}</div>` : ''}
        <div class="stat-row">
          <span class="stat-label">👥 Followers</span>
          <span class="stat-value">${data.followers}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">👤 Following</span>
          <span class="stat-value">${data.following}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">📁 Repos</span>
          <span class="stat-value">${data.repos}</span>
        </div>
      `;
    }
  }
};

async function loadSocialStats() {
  const socialButtons = document.querySelectorAll('.social-btn');
  
  for (const btn of socialButtons) {
    const platform = btn.dataset.social;
    const username = btn.dataset.username;
    const tooltip = btn.querySelector('.social-tooltip');
    
    if (!platform || !username || !tooltip) continue;
    
    const config = SOCIAL_STATS[platform];
    if (!config) continue;
    
    // Show loading state
    tooltip.innerHTML = `
      <div class="tooltip-loading">
        <span class="spinner"></span>
        Loading stats...
      </div>
    `;
    
    // Fetch stats
    const data = await config.fetch(username);
    
    // Update tooltip
    if (data) {
      data.username = username;
      tooltip.innerHTML = config.format(data);
    } else {
      tooltip.innerHTML = `
        <div class="tooltip-error">
          Failed to load stats
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadSocialStats, 1000);
});

// Also refresh stats periodically (every 5 minutes)
setInterval(loadSocialStats, 300000);

// Expose for debugging
window.loadSocialStats = loadSocialStats;
// loadAssets.js - Complete fixed version with proper decoration alignment
const colorThief = new ColorThief();
const bannerSync = true;

// Default avatar as data URI (no external file needed)
const DEFAULT_AVATAR = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#7289da" rx="64"/>
  <text x="64" y="80" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">👤</text>
</svg>
`);

async function fetchAvatarsForAll() {
  console.log('🔄 Starting avatar fetch...');
  
  try {
    // 1. Fetch main user avatar
    const mainUserId = "1158429903629336646";
    const avatarElement = document.getElementById("dc-pfp");
    const faviconElement = document.getElementById("short-icon");
    
    if (!avatarElement) {
      console.error('❌ Avatar element not found!');
      return;
    }

    console.log('📸 Fetching main user data for:', mainUserId);
    
    // Fetch user data from API
    const userData = await fetchUserData(mainUserId);
    console.log('📦 User data received:', userData);
    
    if (userData) {
      // Update avatar
      if (userData.avatarUrl) {
        avatarElement.src = userData.avatarUrl;
        console.log('✅ Main avatar loaded:', userData.avatarUrl);
        
        // Apply colors from avatar
        avatarElement.onload = () => {
          applyColorsFromImage(avatarElement);
        };
      } else {
        avatarElement.src = DEFAULT_AVATAR;
      }
      
      // Update favicon
      if (userData.avatarUrl && faviconElement) {
        faviconElement.href = userData.avatarUrl;
      }
      
      // Apply banner
      if (userData.bannerUrl && bannerSync) {
        document.body.style.backgroundImage = `url(${userData.bannerUrl}?size=1024)`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        console.log('✅ Banner applied');
      }
      
      // Apply profile decoration with proper alignment
      if (userData.profileDecorationUrl) {
        applyProfileDecoration(avatarElement, userData.profileDecorationUrl);
      }
    }

    // 2. Fetch friend avatars
    console.log('👥 Fetching friend avatars...');
    await fetchFriendAvatars();
    
    console.log('✅ Avatar fetch complete!');
  } catch (error) {
    console.error('❌ Error fetching avatars:', error);
  }
}

async function fetchUserData(userId) {
  try {
    const response = await fetch(`https://api.wxrn.lol/discord/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      avatarUrl: data.avatarUrl || null,
      bannerUrl: data.bannerUrl || null,
      profileDecorationUrl: data.profileDecorationUrl || null,
      username: data.username || null,
      displayName: data.displayName || null
    };
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return null;
  }
}

async function fetchFriendAvatars() {
  // Get all friend avatar images from the popup
  const friendImages = document.querySelectorAll('#popup li img');
  
  for (let img of friendImages) {
    const userId = img.getAttribute('alt');
    
    if (!userId || userId === '') {
      console.warn('No Discord ID for friend, using default avatar');
      img.src = DEFAULT_AVATAR;
      continue;
    }
    
    try {
      const response = await fetch(`https://api.wxrn.lol/discord/user/${userId}`);
      
      if (!response.ok) {
        img.src = DEFAULT_AVATAR;
        continue;
      }
      
      const data = await response.json();
      
      if (data.avatarUrl) {
        img.src = data.avatarUrl;
        console.log(`✅ Friend avatar loaded for ${userId}`);
      } else {
        img.src = DEFAULT_AVATAR;
      }
    } catch (error) {
      console.error(`Failed to fetch friend avatar for ${userId}:`, error);
      img.src = DEFAULT_AVATAR;
    }
  }
}

// FIXED: Properly aligned profile decoration
function applyProfileDecoration(avatarElement, decorationUrl) {
  // Create container if it doesn't exist
  let avatarContainer = document.getElementById("avatar-container");
  
  if (!avatarContainer) {
    avatarContainer = document.createElement("div");
    avatarContainer.id = "avatar-container";
    
    // Make container a square with the same size as the avatar
    avatarContainer.style.position = "relative";
    avatarContainer.style.display = "inline-block";
    avatarContainer.style.width = "128px";
    avatarContainer.style.height = "128px";
    avatarContainer.style.flexShrink = "0";
    
    // Insert container before the avatar and move avatar inside
    avatarElement.parentNode.insertBefore(avatarContainer, avatarElement);
    avatarContainer.appendChild(avatarElement);
  }

  // Style the avatar to fill the container perfectly
  avatarElement.style.position = "absolute";
  avatarElement.style.top = "0";
  avatarElement.style.left = "0";
  avatarElement.style.width = "100%";
  avatarElement.style.height = "100%";
  avatarElement.style.objectFit = "cover";
  avatarElement.style.borderRadius = "50%";
  avatarElement.style.zIndex = "1";
  avatarElement.style.display = "block";

  // Create or update decoration element
  let decorationElement = document.getElementById("avatar-decoration");
  if (!decorationElement) {
    decorationElement = document.createElement("img");
    decorationElement.id = "avatar-decoration";
    avatarContainer.appendChild(decorationElement);
  }

  // FIXED: Properly center the decoration
  decorationElement.src = decorationUrl;
  decorationElement.style.position = "absolute";
  decorationElement.style.top = "50%";
  decorationElement.style.left = "50%";
  decorationElement.style.transform = "translate(-50%, -50%)";
  decorationElement.style.width = "120%"; // Slightly larger than the container
  decorationElement.style.height = "120%";
  decorationElement.style.pointerEvents = "none";
  decorationElement.style.zIndex = "2";
  decorationElement.style.objectFit = "contain";
  decorationElement.style.maxWidth = "none";
  decorationElement.style.maxHeight = "none";
  
  console.log('✅ Profile decoration applied with proper alignment:', decorationUrl);
}

function applyColorsFromImage(imgElement) {
  if (!imgElement.complete) {
    console.warn("Image not fully loaded for color extraction");
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0, 100, 100);

    const dominantColor = colorThief.getColor(canvas);
    const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

    document.documentElement.style.setProperty("--accent-color", dominantColorRgb);
    
    const textColor = adjustColorBrightness(dominantColorRgb, 80);
    const lighterTextColor = adjustColorBrightness(dominantColorRgb, 95);
    
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--text-color-light", lighterTextColor);
    document.documentElement.style.setProperty("--icon-color", dominantColorRgb);
    document.documentElement.style.setProperty("--scroll-bar", dominantColorRgb);

    const darkenedBackgroundColor = adjustColorBrightness(dominantColorRgb, -90);
    document.documentElement.style.setProperty("--bg-color", darkenedBackgroundColor);
    document.body.style.backgroundColor = darkenedBackgroundColor;

    console.log("🎨 Colors applied based on the image");
  } catch (error) {
    console.error("Error extracting colors:", error);
  }
}

function adjustColorBrightness(color, percent) {
  const rgb = color.match(/\d+/g).map(Number);
  const adjust = (value, percent) =>
    Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));
  const adjustedColor = rgb.map((value) => adjust(value, percent));
  return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, fetching avatars...');
  fetchAvatarsForAll();
});

// Also run on load as backup
window.addEventListener('load', () => {
  console.log('📋 Window loaded, checking avatars...');
  
  // Check if avatars were loaded, if not, retry
  const mainAvatar = document.getElementById('dc-pfp');
  if (mainAvatar && (mainAvatar.src.includes('black.png') || mainAvatar.src.includes('data:image'))) {
    console.log('🔄 Retrying avatar fetch...');
    setTimeout(fetchAvatarsForAll, 500);
  }
});

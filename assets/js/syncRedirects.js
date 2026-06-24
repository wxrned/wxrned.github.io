const colorThief = new ColorThief();

async function fetchAndApplyIcon() {
  try {
    // FIXED: Use the correct /discord/invite/:inviteCode endpoint
    const response = await fetch("https://api.wxrn.lol/discord/invite/yet");
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return;
    }
    
    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error("API Error:", data.error);
      return;
    }

    // Try to get icon from different possible response formats
    let iconUrl = data.icon || data.iconUrl || data.icon_url || data.avatar_url || data.avatar;
    
    if (!iconUrl) {
      console.warn("No icon URL found in response, using fallback");
      // Try to get from guild data if available
      if (data.guild && data.guild.icon) {
        const guildId = data.guild.id || data.guild_id || data.id;
        if (guildId) {
          iconUrl = `https://cdn.discordapp.com/icons/${guildId}/${data.guild.icon}.png?size=256`;
        }
      }
    }
    
    if (!iconUrl) {
      console.error("No icon URL could be determined");
      return;
    }

    // Create an image element and load the icon
    const iconElement = new Image();
    iconElement.crossOrigin = "Anonymous";
    iconElement.src = iconUrl;

    iconElement.onload = () => {
      console.log("Icon loaded successfully:", iconUrl);
      applyColorsFromImage(iconElement);
      
      // Also update favicon if available
      const faviconElement = document.querySelector("#short-icon");
      if (faviconElement) {
        faviconElement.href = iconUrl;
      }
      
      // Clean up the temporary image
      if (iconElement.parentNode) {
        iconElement.parentNode.removeChild(iconElement);
      }
    };

    iconElement.onerror = () => {
      console.error("Failed to load icon image:", iconUrl);
      // Try fallback to default icon
      const defaultIcon = "assets/img/default-icon.png";
      const fallbackImg = new Image();
      fallbackImg.src = defaultIcon;
      fallbackImg.onload = () => {
        applyColorsFromImage(fallbackImg);
      };
    };

    // Add to body temporarily if needed
    document.body.appendChild(iconElement);
  } catch (error) {
    console.error("Failed to fetch icon data:", error);
  }
}

function applyColorsFromImage(imgElement) {
  if (!imgElement.complete) {
    console.error("Image not fully loaded!");
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width || 100;
    canvas.height = imgElement.height || 100;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    try {
      const dominantColor = colorThief.getColor(canvas);
      const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

      const textColor = adjustColorBrightness(dominantColorRgb, 80);
      const lighterTextColor = adjustColorBrightness(dominantColorRgb, 100);
      
      document.documentElement.style.setProperty(
        "--accent-color",
        lighterTextColor
      );
      document.documentElement.style.setProperty(
        "--text-color",
        dominantColorRgb
      );
      document.documentElement.style.setProperty(
        "--text-color-light",
        lighterTextColor
      );
      document.documentElement.style.setProperty(
        "--icon-color",
        dominantColorRgb
      );
      document.documentElement.style.setProperty(
        "--scroll-bar",
        dominantColorRgb
      );

      const darkenedBackgroundColor = adjustColorBrightness(
        dominantColorRgb,
        -50
      );
      document.documentElement.style.setProperty(
        "--bg-color",
        darkenedBackgroundColor
      );
      document.body.style.backgroundColor = darkenedBackgroundColor;

      // Apply cursor filter if needed
      const cursorFilter = rgbToFilter(lighterTextColor);

      console.log("Colors and cursors applied based on the image:", {
        dominantColor: dominantColorRgb,
        textColor: textColor,
        lighterTextColor: lighterTextColor,
        darkenedBackgroundColor: darkenedBackgroundColor,
        cursorFilter: cursorFilter,
      });
    } catch (colorError) {
      console.error("Color extraction error:", colorError);
      // Apply fallback colors
      document.documentElement.style.setProperty("--accent-color", "#ffffff");
      document.documentElement.style.setProperty("--text-color", "#ffffff");
      document.documentElement.style.setProperty("--bg-color", "#000000");
    }
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

function adjustColorBrightness(rgbColor, amount) {
  const rgb = rgbColor.match(/\d+/g).map(Number);
  const r = Math.min(Math.max(rgb[0] + amount, 0), 255);
  const g = Math.min(Math.max(rgb[1] + amount, 0), 255);
  const b = Math.min(Math.max(rgb[2] + amount, 0), 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbToFilter(rgbColor) {
  const [r, g, b] = rgbColor.match(/\d+/g).map(Number);
  const normalizedColor = [r / 255, g / 255, b / 255];

  return `invert(100%) sepia(100%) saturate(10000%) hue-rotate(${Math.atan2(
    normalizedColor[1] - normalizedColor[0],
    normalizedColor[2] - normalizedColor[0]
  )}deg)`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other elements are loaded
  setTimeout(fetchAndApplyIcon, 500);
});

// Also try on window load as a backup
window.addEventListener('load', () => {
  // Check if colors were already applied, if not, try again
  const hasColors = document.documentElement.style.getPropertyValue('--accent-color');
  if (!hasColors || hasColors === '') {
    setTimeout(fetchAndApplyIcon, 1000);
  }
});

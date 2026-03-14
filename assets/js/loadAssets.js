const colorThief = new ColorThief();
const bannerSync = true;

async function fetchAvatarsForAll() {
  const liElements = document.querySelectorAll("#popup li");

  const discordId = "1158429903629336646";
  const avatarElement = document.querySelector("#dc-pfp");
  const faviconElement = document.querySelector("#short-icon");
  let decorationElement = document.getElementById("avatar-decoration");

  if (avatarElement) {
    avatarElement.src = "assets/img/black.png";
    avatarElement.style.borderRadius = "50%";
    avatarElement.style.border = "3px solid white";

    // FIXED: Use the new route format
    const resData = await fetchImages(avatarElement, discordId, true);

    if (resData && resData.bannerUrl) {
      if (bannerSync) {
        document.body.style.backgroundImage = `url(${
          resData.bannerUrl + "?size=1024"
        })`;
      }
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }

    if (resData && resData.avatarUrl) {
      avatarElement.src = resData.avatarUrl;
    }

    if (resData && resData.profileDecorationUrl) {
      let avatarContainer = document.getElementById("avatar-container");
      
      // Create container if it doesn't exist
      if (!avatarContainer) {
        avatarContainer = document.createElement("div");
        avatarContainer.id = "avatar-container";
        
        // Center the container properly
        avatarContainer.style.position = "relative";
        avatarContainer.style.display = "flex";
        avatarContainer.style.justifyContent = "center";
        avatarContainer.style.alignItems = "center";
        avatarContainer.style.margin = "0 auto";
        avatarContainer.style.width = "fit-content";
        avatarContainer.style.height = "fit-content";
        
        // Insert container before the avatar and move avatar inside
        avatarElement.parentNode.insertBefore(avatarContainer, avatarElement);
        avatarContainer.appendChild(avatarElement);
      }

      // Ensure container dimensions match avatar
      const updateContainerSize = () => {
        const avatarWidth = avatarElement.clientWidth;
        const avatarHeight = avatarElement.clientHeight;
        
        if (avatarWidth > 0 && avatarHeight > 0) {
          avatarContainer.style.width = avatarWidth + "px";
          avatarContainer.style.height = avatarHeight + "px";
        }
      };
      
      // Update size after avatar loads
      if (avatarElement.complete) {
        updateContainerSize();
      } else {
        avatarElement.onload = updateContainerSize;
      }

      // Style the avatar
      avatarElement.style.position = "relative";
      avatarElement.style.zIndex = "1";
      avatarElement.style.display = "block";
      avatarElement.style.width = "100%";
      avatarElement.style.height = "100%";
      avatarElement.style.objectFit = "cover";
      avatarElement.style.borderRadius = "50%";

      // Create or update decoration element
      if (!decorationElement) {
        decorationElement = document.createElement("img");
        decorationElement.id = "avatar-decoration";
        avatarContainer.appendChild(decorationElement);
      }

      // Style the decoration - FIXED POSITIONING
      decorationElement.src = resData.profileDecorationUrl;
      decorationElement.style.position = "absolute";
      decorationElement.style.top = "50%";
      decorationElement.style.left = "50%";
      decorationElement.style.transform = "translate(-50%, -50%)";
      decorationElement.style.width = "120%";
      decorationElement.style.height = "120%";
      decorationElement.style.pointerEvents = "none";
      decorationElement.style.zIndex = "2";
      decorationElement.style.objectFit = "contain";
      
      // Ensure decoration doesn't overflow
      decorationElement.style.maxWidth = "none";
      decorationElement.style.maxHeight = "none";
      
      // Log for debugging
      console.log("Decoration applied:", {
        url: resData.profileDecorationUrl,
        containerSize: avatarContainer.style.width,
        avatarSize: avatarElement.clientWidth
      });
    }

    if (resData && resData.avatarUrl && faviconElement) {
      faviconElement.href = resData.avatarUrl;
    } else if (!faviconElement) {
      console.error('No element with id="short-icon" found.');
    }
  } else {
    console.error('No element with id="dc-pfp" found.');
  }

  for (let li of liElements) {
    const imgElement = li.querySelector("img");

    if (imgElement) {
      const userId = imgElement.alt;
      imgElement.src = "assets/img/black.png";

      if (userId) {
        // FIXED: Pass false to indicate this is not the main avatar
        await fetchImages(imgElement, userId, false);
      } else {
        console.error("No Discord User ID found in the alt attribute.");
      }
    }
  }
}

// FIXED: Updated function with correct API endpoints
async function fetchImages(imgElement, userId, isMainAvatar = false) {
  try {
    // Use the new /discord/user/:userId endpoint
    const response = await fetch(`https://api.wxrn.lol/user/${userId}`);

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      console.error(`Error for user ${userId}: ${data.error}`);
      return null;
    }

    // For main avatar, we need additional data
    if (isMainAvatar) {
      // FIXED: Fetch invite data separately for banner and decoration
      const inviteResponse = await fetch(`https://api.wxrn.lol/invite/huh`);
      const inviteData = await inviteResponse.json();
      
      const result = {
        avatarUrl: `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.${data.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=256`,
        bannerUrl: inviteData.banner || data.banner,
        profileDecorationUrl: data.avatar_decoration_data?.asset 
          ? `https://cdn.discordapp.com/avatar-decoration-presets/${data.avatar_decoration_data.asset}.png?size=128&passthrough=true`
          : null
      };
      
      if (data.avatar) {
        imgElement.src = result.avatarUrl;
        
        return new Promise((resolve, reject) => {
          imgElement.onload = () => {
            applyColorsFromImage(imgElement);
            resolve(result);
          };
          imgElement.onerror = reject;
        });
      }
      return result;
    } 
    // For friend avatars
    else if (data.avatar) {
      const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.${data.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`;
      imgElement.src = avatarUrl;
      
      return new Promise((resolve, reject) => {
        imgElement.onload = () => {
          resolve({ avatarUrl });
        };
        imgElement.onerror = reject;
      });
    }
  } catch (error) {
    console.error(`Failed to fetch avatar for user ${userId}:`, error);
  }

  return null;
}

function applyColorsFromImage(imgElement) {
  if (imgElement.dataset.isAlbumCover === "true") {
    return;
  }

  if (!imgElement.complete) {
    console.error("Image not fully loaded!");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

  try {
    const dominantColor = colorThief.getColor(canvas);
    const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

    document.documentElement.style.setProperty(
      "--accent-color",
      dominantColorRgb
    );
    const textColor = adjustColorBrightness(dominantColorRgb, 80);
    const lighterTextColor = adjustColorBrightness(dominantColorRgb, 95);
    const iconColor = dominantColorRgb;
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty(
      "--text-color-light",
      lighterTextColor
    );
    document.documentElement.style.setProperty("--icon-color", iconColor);
    document.documentElement.style.setProperty(
      "--scroll-bar",
      dominantColorRgb
    );

    const darkenedBackgroundColor = adjustColorBrightness(
      dominantColorRgb,
      -90
    );
    document.documentElement.style.setProperty(
      "--bg-color",
      darkenedBackgroundColor
    );

    document.body.style.backgroundColor = darkenedBackgroundColor;

    console.log("Colors applied based on the image:", {
      dominantColor: dominantColorRgb,
      textColor: textColor,
      lighterTextColor: lighterTextColor,
      iconColor: iconColor,
      darkenedBackgroundColor: darkenedBackgroundColor,
    });
  } catch (error) {
    console.error("Error extracting colors from the image:", error);
  }
}

function adjustColorBrightness(color, percent) {
  const rgb = color.match(/\d+/g).map(Number);
  const adjust = (value, percent) =>
    Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));
  const adjustedColor = rgb.map((value) => adjust(value, percent));
  return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
}

fetchAvatarsForAll();
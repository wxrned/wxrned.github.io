const colorThief = new ColorThief();

async function fetchAvatarsForAll() {
  const liElements = document.querySelectorAll("#popup li");

  const discordId = "1158429903629336646";
  const avatarElement = document.querySelector("#dc-pfp");
  const faviconElement = document.querySelector("#short-icon");

if (resData && resData.profileDecorationUrl) {
  let avatarContainer = document.getElementById("avatar-container");

  if (!avatarContainer) {
    avatarContainer = document.createElement("div");
    avatarContainer.id = "avatar-container";
    avatarContainer.style.position = "relative";
    avatarContainer.style.display = "inline-block";
    
    avatarElement.parentNode.insertBefore(avatarContainer, avatarElement);
    avatarContainer.appendChild(avatarElement);
  }

  let decorationElement = document.getElementById("avatar-decoration");

  if (!decorationElement) {
    decorationElement = document.createElement("img");
    decorationElement.id = "avatar-decoration";
    avatarContainer.appendChild(decorationElement);
  }

  decorationElement.src = resData.profileDecorationUrl;
  decorationElement.style.position = "absolute";
  decorationElement.style.top = "50%";
  decorationElement.style.left = "50%";
  decorationElement.style.transform = "translate(-50%, -50%)";
  decorationElement.style.width = "115%"; // Slightly larger to align properly
  decorationElement.style.height = "115%";
  decorationElement.style.pointerEvents = "none";
  decorationElement.style.zIndex = "2";

  avatarElement.style.position = "relative";
  avatarElement.style.zIndex = "1";
}

  for (let li of liElements) {
    const imgElement = li.querySelector("img");

    if (imgElement) {
      const userId = imgElement.alt;
      imgElement.src = "assets/img/black.png";

      if (userId) {
        await fetchImages(imgElement, userId);
      } else {
        console.error("No Discord User ID found in the alt attribute.");
      }
    }
  }
}

async function fetchImages(imgElement, userId) {
  try {
    let response = await fetch(`https://api.wxrn.lol/api/discord/${userId}`);

    if (!response.ok) {
      response = await fetch(
        `https://cors-anywhere.herokuapp.com/https://api.wxrn.lol/api/discord/${userId}`
      );
    }

    const data = await response.json();

    if (data.avatarUrl) {
      imgElement.src = data.avatarUrl;

      const avatarPromise = new Promise((resolve, reject) => {
        imgElement.onload = () => {
          applyColorsFromImage(imgElement);
          resolve(data);
        };

        imgElement.onerror = () => {
          console.error(`Failed to load avatar image for user ${userId}`);
          reject(new Error(`Avatar image failed to load for user ${userId}`));
        };
      });

      return avatarPromise;
    } else if (data.error) {
      console.error(`Error for user ${userId}: ${data.error}`);
    }
  } catch (error) {
    console.error(
      `Failed to fetch avatar and banner for user ${userId}:`,
      error
    );
  }

  return null;
}

function applyColorsFromImage(imgElement) {
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
    const textColor = adjustColorBrightness(dominantColorRgb, -50);
    const lighterTextColor = adjustColorBrightness(dominantColorRgb, 20);
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
      -80
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

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

    const resData = await fetchImages(avatarElement, discordId);

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
      if (!avatarContainer) {
        avatarContainer = document.createElement("div");
        avatarContainer.id = "avatar-container";
        avatarContainer.style.position = "relative";
        avatarContainer.style.display = "inline-block";
        avatarContainer.style.overflow = "visible";

        avatarElement.parentNode.insertBefore(avatarContainer, avatarElement);
        avatarContainer.appendChild(avatarElement);
      }

      avatarContainer.style.width = avatarElement.clientWidth + "px";
      avatarContainer.style.height = avatarElement.clientHeight + "px";

      avatarElement.style.position = "relative";
      avatarElement.style.zIndex = "1";

      if (!decorationElement) {
        decorationElement = document.createElement("img");
        decorationElement.id = "avatar-decoration";
        avatarContainer.appendChild(decorationElement);
      }

      decorationElement.src = resData.profileDecorationUrl;
      decorationElement.style.position = "absolute";
      decorationElement.style.top = "-10%";
      decorationElement.style.left = "-10%";
      decorationElement.style.width = "120%";
      decorationElement.style.height = "120%";
      decorationElement.style.pointerEvents = "none";
      decorationElement.style.zIndex = "2";
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
        await fetchImages(imgElement, userId);
      } else {
        console.error("No Discord User ID found in the alt attribute.");
      }
    }
  }
}

async function fetchImages(imgElement, userId) {
  try {
    let response = await fetch(`https://api.wxrn.lol:9069/discord/${userId}`);

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
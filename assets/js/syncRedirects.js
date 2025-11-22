const colorThief = new ColorThief();

async function fetchAndApplyIcon() {
  try {
    const response = await fetch("https://api.wxrn.lol:9069/discord/invite/huh");
    const data = await response.json();

    const iconUrl = data.icon;
    if (!iconUrl) {
      console.error("No icon URL found in response");
      return;
    }

    const iconElement = new Image();
    iconElement.crossOrigin = "Anonymous";
    iconElement.src = iconUrl;

    iconElement.onload = () => {
      applyColorsFromImage(iconElement);
    };

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

  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

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

    const cursorFilter = rgbToFilter(lighterTextColor);

    console.log("Colors and cursors applied based on the image:", {
      dominantColor: dominantColorRgb,
      textColor: textColor,
      lighterTextColor: lighterTextColor,
      darkenedBackgroundColor: darkenedBackgroundColor,
      cursorFilter: cursorFilter,
    });
  } catch (error) {
    console.error("Error extracting colors from the image:", error);
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

fetchAndApplyIcon();

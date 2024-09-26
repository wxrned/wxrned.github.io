// Assuming Color Thief is already included
const colorThief = new ColorThief();

async function fetchAvatarsForAll() {
    const liElements = document.querySelectorAll('#popup li');
    const discordId = '1158429903629336646';
    const avatarElement = document.querySelector('#dc-pfp');
    const faviconElement = document.querySelector('#short-icon');

    if (avatarElement) {
        avatarElement.src = "assets/img/black.png"; // Placeholder while fetching
        const avatarUrl = await fetchImages(avatarElement, discordId);

        if (avatarUrl && faviconElement) {
            faviconElement.href = avatarUrl;
        } else if (!faviconElement) {
            console.error('No element with id="short-icon" found.');
        }
    } else {
        console.error('No element with id="dc-pfp" found.');
    }

    for (let li of liElements) {
        const imgElement = li.querySelector('img');

        if (imgElement) {
            const userId = imgElement.alt;
            imgElement.src = "assets/img/black.png"; // Placeholder while fetching

            if (userId) {
                await fetchAndSetAvatar(imgElement, userId);
            } else {
                console.error('No Discord User ID found in the alt attribute.');
            }
        }
    }
}

async function fetchImages(imgElement, userId) {
    try {
        let response = await fetch(`https://api.wxrn.lol/api/avatar/${userId}`);

        // Fallback fetch in case of failure with the primary URL
        if (!response.ok) {
            response = await fetch(`https://cors-anywhere.herokuapp.com/https://185.228.81.59:3000/api/avatar/${userId}`);
        }

        const data = await response.json();

        if (data.avatarUrl) {
            // Set the avatar URL for the img element
            imgElement.src = data.avatarUrl;

            // Return a promise to handle the image load
            const avatarPromise = new Promise((resolve, reject) => {
                imgElement.onload = () => {
                    applyColorsFromImage(imgElement); // Call color extraction function
                    resolve(data.avatarUrl);
                };

                imgElement.onerror = () => {
                    console.error(`Failed to load avatar image for user ${userId}`);
                    reject(new Error(`Avatar image failed to load for user ${userId}`));
                };
            });

            // Check if a banner URL is present, then set it as the background
            if (data.bannerUrl) {
                document.body.style.backgroundImage = `url(${data.bannerUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                console.log(`Banner set for user ${userId}`);
            }

            return avatarPromise; // Resolve the promise with the avatar URL
        } else if (data.error) {
            console.error(`Error for user ${userId}: ${data.error}`);
        }
    } catch (error) {
        console.error(`Failed to fetch avatar and banner for user ${userId}:`, error);
    }

    return null; // Return null if there was an error
}

    
function applyColorsFromImage(imgElement) {
    if (!imgElement.complete) {
        console.error('Image not fully loaded!');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

    try {
        // Get the dominant color from the image
        const dominantColor = colorThief.getColor(canvas);
        const dominantColorRgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;

        // Update CSS variables for accent and other colors
        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);
        const textColor = adjustColorBrightness(dominantColorRgb, -50); // Darker text color
        const lighterTextColor = adjustColorBrightness(dominantColorRgb, 20); // Lighter text color
        const iconColor = dominantColorRgb; // Use accent color for icons
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-color-light', lighterTextColor);
        document.documentElement.style.setProperty('--icon-color', iconColor);
        document.documentElement.style.setProperty('--scroll-bar', dominantColorRgb);

        // Apply a very darkened version of the color for the background
        const darkenedBackgroundColor = adjustColorBrightness(dominantColorRgb, -80); // Darken by 80%
        document.documentElement.style.setProperty('--bg-color', darkenedBackgroundColor);

        // Directly set the background color without any blur
        document.body.style.backgroundColor = darkenedBackgroundColor;

        console.log('Colors applied based on the image:', {
            dominantColor: dominantColorRgb,
            textColor: textColor,
            lighterTextColor: lighterTextColor,
            iconColor: iconColor,
            darkenedBackgroundColor: darkenedBackgroundColor
        });
    } catch (error) {
        console.error('Error extracting colors from the image:', error);
    }
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
    const rgb = color.match(/\d+/g).map(Number);
    const adjust = (value, percent) => Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));
    const adjustedColor = rgb.map(value => adjust(value, percent));
    return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
}

// Call the function to fetch avatars for all users
fetchAvatarsForAll();

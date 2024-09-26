// Assuming Color Thief is already included 
const colorThief = new ColorThief();

async function fetchAvatarsForAll() {
    const liElements = document.querySelectorAll('#popup li');

    // Set avatar and banner for the main user (with the specified Discord ID)
    const discordId = '1158429903629336646'; // Main user's Discord ID
    const avatarElement = document.querySelector('#dc-pfp');
    const faviconElement = document.querySelector('#short-icon');

    if (avatarElement) {
        avatarElement.src = "assets/img/black.png"; // Placeholder while fetching
        const resData = await fetchImages(avatarElement, discordId);

        if (resData && resData.bannerUrl) {
            document.body.style.backgroundImage = `url(${resData.bannerUrl + "?size=1024"})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        }

        if (resData && resData.avatarUrl && faviconElement) {
            faviconElement.href = resData.avatarUrl;
        } else if (!faviconElement) {
            console.error('No element with id="short-icon" found.');
        }
    } else {
        console.error('No element with id="dc-pfp" found.');
    }

    // Iterate through each list item and fetch avatars and banners for other users
    for (let li of liElements) {
        const imgElement = li.querySelector('img');

        if (imgElement) {
            const userId = imgElement.alt;

            imgElement.src = "assets/img/black.png"; // Placeholder while fetching

            if (userId) {
                const userData = await fetchImages(imgElement, userId);

                // Check if the user has a banner, and set it as the background for the current user.
                if (userData && userData.bannerUrl) {
                    document.body.style.backgroundImage = `url(${userData.bannerUrl + "?size=1024"})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    console.log(`Updated background with banner for user ${userId}`);
                }
            } else {
                console.error('No Discord User ID found in the alt attribute.');
            }
        }
    }
}

async function fetchImages(imgElement, userId) {
    try {
        let response = await fetch(`https://api.wxrn.lol/api/discord/${userId}`);

        // Fallback fetch in case of failure with the primary URL
        if (!response.ok) {
            response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.wxrn.lol/api/discord/${userId}`);
        }

        const data = await response.json();

        if (data.avatarUrl) {
            // Set the avatar URL for the img element
            imgElement.src = data.avatarUrl;

            // Return a promise to handle the image load
            const avatarPromise = new Promise((resolve, reject) => {
                imgElement.onload = () => {
                    applyColorsFromImage(imgElement);
                    resolve(data); // Resolve with the full data object (avatar and banner URLs)
                };

                imgElement.onerror = () => {
                    console.error(`Failed to load avatar image for user ${userId}`);
                    reject(new Error(`Avatar image failed to load for user ${userId}`));
                };
            });

            return avatarPromise; // Resolve the promise with the data
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

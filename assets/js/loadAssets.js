// Assuming ColorThief is included in your project
const colorThief = new ColorThief();

async function fetchAvatarsForAll() {
    const liElements = document.querySelectorAll('#popup li');
    const myUserId = '1158429903629336646';
    const myAvatarElement = document.querySelector('#dc-pfp');
    const faviconElement = document.querySelector('#short-icon');

    if (myAvatarElement) {
        myAvatarElement.src = "assets/img/black.png"; // Placeholder while fetching
        const avatarUrl = await fetchAndSetAvatar(myAvatarElement, myUserId);

        // Set the favicon if the avatar was successfully fetched
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

async function fetchAndSetAvatar(imgElement, userId) {
    try {
        let response = await fetch(`https://api.wxrn.lol/api/avatar/${userId}`);

        if (!response.ok) {
            response = await fetch(`https://cors-anywhere.herokuapp.com/https://185.228.81.59:3000/api/avatar/${userId}`);
        }

        const data = await response.json();

        if (data.avatarUrl) {
            imgElement.src = data.avatarUrl;

            // Create a Promise that resolves when the image has loaded
            return new Promise((resolve, reject) => {
                imgElement.onload = () => {
                    applyColorsFromImage(imgElement); // Call color extraction function
                    resolve(data.avatarUrl); // Resolve the promise with the URL
                };

                imgElement.onerror = () => {
                    console.error(`Failed to load image for user ${userId}`);
                    reject(new Error(`Image failed to load for user ${userId}`));
                };
            });
        } else if (data.error) {
            console.error(`Error for user ${userId}: ${data.error}`);
        }
    } catch (error) {
        console.error(`Failed to fetch avatar for user ${userId}:`, error);
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

        // Update CSS variables
        document.documentElement.style.setProperty('--accent-color', dominantColorRgb);

        // Generate lighter and darker shades for additional variables
        const textColor = adjustColorBrightness(dominantColorRgb, -50); // Darker shade for text
        const lighterTextColor = adjustColorBrightness(dominantColorRgb, 20); // Lighter shade for light text
        const iconColor = dominantColorRgb; // Same as accent
        const scrollBarColor = dominantColorRgb; // Same as accent

        // Set the CSS variables
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--text-color-light', lighterTextColor);
        document.documentElement.style.setProperty('--icon-color', iconColor);
        document.documentElement.style.setProperty('--scroll-bar', scrollBarColor);

        console.log('Colors applied based on the image:', {
            dominantColor: dominantColorRgb,
            textColor: textColor,
            lighterTextColor: lighterTextColor,
            iconColor: iconColor,
            scrollBarColor: scrollBarColor,
        });
    } catch (error) {
        console.error('Error extracting colors from the image:', error);
    }
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
    // Convert the rgb string to an array of RGB values
    const rgb = color.match(/\d+/g).map(Number);
    const adjust = (value, percent) => Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));

    // Adjust the brightness of each RGB component
    const adjustedColor = rgb.map(value => adjust(value, percent));
    return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
}

// Call the function to fetch avatars for all users
fetchAvatarsForAll();

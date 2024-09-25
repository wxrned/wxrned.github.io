async function fetchAvatarsForAll() {
    const liElements = document.querySelectorAll('#popup li');
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const myUserId = '1158429903629336646';
    const myAvatarElement = document.querySelector('#dc-pfp');
    const faviconElement = document.querySelector('#short-icon');

    const fetchAndSetAvatar = async (imgElement, userId) => {
        try {
            let response = await fetch(`https://api.wxrn.lol/api/avatar/${userId}`);
            if (!response.ok) {
                response = await fetch(`${corsProxy}https://185.228.81.59:3000/api/avatar/${userId}`);
            }

            const data = await response.json();
            if (data.avatarUrl) {
                imgElement.src = data.avatarUrl;
                imgElement.onload = function() {
                    applyColorsFromImage(imgElement);
                };
                return data.avatarUrl;
            } else if (data.error) {
                console.error(`Error for user ${userId}: ${data.error}`);
            }
        } catch (error) {
            console.error(`Failed to fetch avatar for user ${userId}:`, error);
        }
        return null; // Return null if there was an error
    };

    if (myAvatarElement) {
        myAvatarElement.src = "assets/img/black.png"; // Placeholder while fetching
        const avatarUrl = await fetchAndSetAvatar(myAvatarElement, myUserId);

        // If your avatar was successfully fetched, set the favicon as well
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

fetchAvatarsForAll();

async function fetchAvatarsForAll() {
    const liElements = document.querySelectorAll('#popup li');
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const myUserId = 'YOUR_DISCORD_USER_ID'; // Replace with your actual Discord user ID
    const myAvatarElement = document.querySelector('#dc-pfp'); // Get the element for your own avatar
    const faviconElement = document.querySelector('#short-icon'); // Get the favicon element

    // Function to fetch and set an avatar
    const fetchAndSetAvatar = async (imgElement, userId) => {
        try {
            let response = await fetch(`https://api.wxrn.lol/api/avatar/${userId}`);
            if (!response.ok) {
                response = await fetch(`${corsProxy}https://185.228.81.59:3000/api/avatar/${userId}`);
            }

            const data = await response.json();
            if (data.avatarUrl) {
                imgElement.src = data.avatarUrl;
                return data.avatarUrl; // Return the avatar URL for further use
            } else if (data.error) {
                console.error(`Error for user ${userId}: ${data.error}`);
            }
        } catch (error) {
            console.error(`Failed to fetch avatar for user ${userId}:`, error);
        }
        return null; // Return null if there was an error
    };

    // Fetch and set avatars for all users in the list
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

    // Fetch and set your own avatar
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
}

fetchAvatarsForAll();

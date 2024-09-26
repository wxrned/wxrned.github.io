const fs = require('fs');
const path = require('path');

async function getFetch() {
    const fetch = await import('node-fetch');
    return fetch.default; // Import node-fetch as it uses ES Modules
}

async function getColorThief() {
    const ColorThief = await import('color-thief-browser'); // Dynamically load color-thief-browser
    return ColorThief.default;
}

async function getDominantColor(imageUrl) {
    const ColorThief = await getColorThief(); // Dynamically load ColorThief
    const colorThief = new ColorThief();
    try {
        const fetch = await getFetch(); // Dynamically load fetch
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image for dominant color: ${response.statusText}`);
        }

        // Use arrayBuffer to get the image data
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([new Uint8Array(arrayBuffer)]); // Create a Blob from the array buffer
        const imageElement = await createImageElement(blob); // Create an Image element from the Blob

        // Get the dominant color
        const dominantColor = colorThief.getColor(imageElement);
        return `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
    } catch (error) {
        console.error("Error fetching dominant color:", error);
        process.exit(254);
    }
}

function createImageElement(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url); // Clean up the object URL
            resolve(img);
        };
        img.onerror = reject; // Handle errors
        img.src = url;
    });
}

async function fetchAvatarUrl(userId) {
    try {
        const fetch = await getFetch(); // Dynamically load fetch
        const response = await fetch(`https://api.wxrn.lol/api/avatar/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch avatar URL: ${response.statusText}`);
        }
        const data = await response.json();
        return data.avatarUrl; // Extract the avatar URL
    } catch (error) {
        console.error("Error fetching avatar URL:", error);
        process.exit(254);
    }
}

async function main() {
    try {
        console.log("Starting script...");

        const dataFilePath = path.join(__dirname, 'data.json');
        const htmlFilePath = path.join(__dirname, 'index.html');

        console.log(`Checking if ${dataFilePath} exists...`);
        if (!fs.existsSync(dataFilePath)) {
            console.error(`File not found: ${dataFilePath}`);
            process.exit(254);
        }

        console.log(`Reading data from ${dataFilePath}...`);
        let dynamicData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        console.log("Successfully read data:", dynamicData);

        // Fetch the Discord avatar URL from the API
        const userId = dynamicData.userId; // Ensure userId is set in data.json
        console.log(`Fetching avatar URL for user ID ${userId}...`);
        
        const discordPfpUrl = await fetchAvatarUrl(userId);
        console.log(`Fetched avatar URL: ${discordPfpUrl}`);

        console.log(`Fetching dominant color from ${discordPfpUrl}...`);
        const dominantColor = await getDominantColor(discordPfpUrl);
        dynamicData.themeColor = dominantColor; // Update the dynamicData with the new theme color

        console.log(`Dominant color fetched: ${dominantColor}`);

        // Additional logic for updating the HTML file
        if (!fs.existsSync(htmlFilePath)) {
            console.error(`File not found: ${htmlFilePath}`);
            process.exit(254);
        }

        console.log(`Updating ${htmlFilePath} with new data...`);

        // Read the HTML file content
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

        // Update meta tags using dynamicData
        htmlContent = htmlContent
            .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${dynamicData.title}"`)
            .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${dynamicData.description}"`)
            .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${dynamicData.image}"`)
            .replace(/<meta name="theme-color" content="[^"]*"/, `<meta name="theme-color" content="${dynamicData.themeColor}"`);

        // Write the updated content back to the HTML file
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        console.log("Successfully updated the meta tags in index.html!");

        // Write the updated dynamicData back to data.json
        fs.writeFileSync(dataFilePath, JSON.stringify(dynamicData, null, 2));
        console.log("Successfully updated data.json with new theme color!");

        console.log("Script completed successfully!");
    } catch (error) {
        console.error("An error occurred in the script:", error);
        process.exit(254);
    }
}

// Execute the main function
main();

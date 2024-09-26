import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';
import Vibrant from 'node-vibrant'; // Import node-vibrant

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getFetch() {
    const fetch = await import('node-fetch');
    return fetch.default; // Import node-fetch as it uses ES Modules
}

async function getDominantColor(imageUrl) {
    try {
        const fetch = await getFetch(); // Dynamically load fetch
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image for dominant color: ${response.statusText}`);
        }

        // Use arrayBuffer to get the image data
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Load image using canvas
        const image = await loadImage(buffer);

        // Create a vibrant instance and get the palette
        const vibrant = await Vibrant.from(image).getPalette();
        
        // Get the dominant color (Vibrant color)
        const dominantColor = vibrant.Vibrant ? vibrant.Vibrant.hex : '#000000'; // Fallback to black if not found
        return dominantColor;
    } catch (error) {
        console.error("Error fetching dominant color:", error);
        process.exit(254);
    }
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

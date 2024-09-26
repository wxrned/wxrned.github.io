import fs from 'fs';
import path from 'path';
import Vibrant from '@vibrant/core';

// Import the CommonJS module using the default import syntax
import pkg from '@vibrant/image-node';
const { NodeImage } = pkg;

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

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a NodeImage instance from the buffer
        const image = new NodeImage(buffer);

        // Create a Vibrant instance and get the palette
        const vibrant = new Vibrant(image);
        const palette = await vibrant.palette();
        const dominantColor = palette.Vibrant; // Get the vibrant color from the palette
        
        if (dominantColor) {
            return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
        } else {
            throw new Error("No dominant color found.");
        }
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

        const dataFilePath = path.join(process.cwd(), 'data.json'); // Use process.cwd() for directory path
        const htmlFilePath = path.join(process.cwd(), 'index.html');

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

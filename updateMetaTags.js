const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas'); // Use the canvas package

async function getDominantColor(imageUrl) {
  try {
    // Fetch the image buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image for dominant color: ${response.statusText}`);
    }
    const buffer = await response.buffer();

    // Load the image into a canvas
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Get pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple algorithm to find the dominant color (you might want to improve this)
    const colorCount = {};
    for (let i = 0; i < data.length; i += 4) {
      const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      colorCount[rgb] = (colorCount[rgb] || 0) + 1;
    }

    // Find the most common color
    const dominantColor = Object.keys(colorCount).reduce((a, b) => colorCount[a] > colorCount[b] ? a : b);
    return `rgb(${dominantColor})`;
  } catch (error) {
    console.error("Error fetching dominant color:", error);
    process.exit(254);
  }
}

async function fetchAvatarUrl(userId) {
  // Dynamically import node-fetch
  const fetch = (await import('node-fetch')).default; // Ensure you have this installed
  try {
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
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${discordPfpUrl}"`) // Update to use avatar URL
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

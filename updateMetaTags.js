const fs = require('fs');
const path = require('path');

// Define the paths for data.json and the HTML file
const dataFilePath = path.join(__dirname, 'data.json');
const htmlFilePath = path.join(__dirname, 'index.html');

// Check if the data.json file exists before proceeding
if (fs.existsSync(dataFilePath)) {
  try {
    // Read and parse the dynamic data from data.json
    const dynamicData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    // Ensure required fields are available
    if (!dynamicData.avatarUrl || !dynamicData.title || !dynamicData.description || !dynamicData.themeColor) {
      console.error('Missing required fields in data.json. Please ensure avatarUrl, title, description, and themeColor are present.');
      process.exit(1);
    }

    // Read the contents of index.html
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

    // Update og:image meta tag
    htmlContent = htmlContent.replace(
      /property="og:image" content="[^"]*"/,
      `property="og:image" content="${dynamicData.avatarUrl}"`
    );

    // Update og:title meta tag
    htmlContent = htmlContent.replace(
      /property="og:title" content="[^"]*"/,
      `property="og:title" content="${dynamicData.title}"`
    );

    // Update og:description meta tag
    htmlContent = htmlContent.replace(
      /property="og:description" content="[^"]*"/,
      `property="og:description" content="${dynamicData.description}"`
    );

    // Update theme-color meta tag
    htmlContent = htmlContent.replace(
      /name="theme-color" content="[^"]*"/,
      `name="theme-color" content="${dynamicData.themeColor}"`
    );

    // Write the updated content back to index.html
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log('Meta tags successfully updated in index.html!');
  } catch (error) {
    console.error('Error processing data.json or index.html:', error);
  }
} else {
  console.error(`File not found: ${dataFilePath}. Ensure data.json exists in the root directory.`);
}

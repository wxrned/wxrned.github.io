const fs = require('fs');
const path = require('path');

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

  // Additional logic for updating the HTML file, with error handling
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

  console.log("Script completed successfully!");
} catch (error) {
  console.error("An error occurred in the script:", error);
  process.exit(254);
}

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

  // Additional logic for updating files, with error handling
  if (!fs.existsSync(htmlFilePath)) {
    console.error(`File not found: ${htmlFilePath}`);
    process.exit(254);
  }

  console.log(`Updating index.html with new data...`);
  // Implement your logic here...

  console.log("Script completed successfully!");
} catch (error) {
  console.error("An error occurred in the script:", error);
  process.exit(254);
}

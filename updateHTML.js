const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const htmlFilePath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

htmlContent = htmlContent
  .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${data.title}$2`)
  .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${data.description}$2`)
  .replace(/(<meta property="og:image" id="embed-icon" content=")[^"]*(" \/>)/, `$1${data.avatarUrl}$2`)
  .replace(/(<meta name="theme-color" content=")[^"]*(" \/>)/, `$1${data.themeColor}$2`)
  .replace(/(<link rel="shortcut icon" id="short-icon" href=")[^"]*(" type="image\/x-icon" \/>)/, `$1${data.avatarUrl}$2`);

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

console.log('Meta tags have been updated in index.html.');

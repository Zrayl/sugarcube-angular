const decompress = require('decompress');
const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('../config.json');

const tweegoDirPath = path.resolve(__dirname, '../.tweego');

// Ensure tweego directory exists
if (!fs.existsSync(tweegoDirPath)) {
  fs.mkdirSync(tweegoDirPath, { recursive: true });
}

// Get Tweego download link based on platform and architecture
function getTweegoZipLink() {
  const platform = process.platform;
  const arch = process.arch === 'x64' ? 'x64' : 
               (process.arch === 'arm64' && platform === 'darwin' ? 'arm64' : 'x86');
  
  const binaries = config.tweego.binaries[platform];
  return binaries[arch] || binaries.x86;
}

// Download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function installTweego() {
  console.log('Installing Tweego...');
  
  try {
    const zipLink = getTweegoZipLink();
    const zipPath = path.resolve(__dirname, '../.tweego.zip');
    
    await downloadFile(zipLink, zipPath);
    await decompress(zipPath, tweegoDirPath);
    
    // Clean up zip file
    fs.unlinkSync(zipPath);
    
    // Make tweego executable on Unix-like systems
    if (['darwin', 'linux'].includes(process.platform)) {
      const tweegoBinPath = path.resolve(tweegoDirPath, 'tweego');
      fs.chmodSync(tweegoBinPath, '755');
    }
    
    console.log('Tweego installed successfully');
  } catch (error) {
    console.error('Failed to install Tweego:', error);
    process.exit(1);
  }
}

// Install SugarCube format
async function installSugarCubeFormat() {
  console.log('Installing SugarCube format...');
  
  try {
    const zipLink = config.tweego.storyFormats.sugarcube.link;
    const zipPath = path.resolve(__dirname, '../.sugarcube.zip');
    const formatDir = path.resolve(tweegoDirPath, 'storyformats');
    
    // Ensure storyformats directory exists
    if (!fs.existsSync(formatDir)) {
      fs.mkdirSync(formatDir, { recursive: true });
    }
    
    await downloadFile(zipLink, zipPath);
    await decompress(zipPath, formatDir);
    
    // Clean up zip file
    fs.unlinkSync(zipPath);
    
    console.log('SugarCube format installed successfully');
  } catch (error) {
    console.error('Failed to install SugarCube format:', error);
    process.exit(1);
  }
}

// Run installations
(async () => {
  await installTweego();
  await installSugarCubeFormat();
})();
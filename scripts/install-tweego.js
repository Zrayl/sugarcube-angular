const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { promisify } = require('util');
const stream = require('stream');

const pipeline = promisify(stream.pipeline);

// Check for config.json
async function main() {
  try {
    const configPath = path.resolve(__dirname, '../config.json');
    if (!fs.existsSync(configPath)) {
      // Create a default config if it doesn't exist
      const defaultConfig = {
        "tweego": {
          "binaries": {
            "version": "v2.1.1",
            "win32": {
              "x64": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-windows-x64.zip",
              "x86": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-windows-x86.zip"
            },
            "darwin": {
              "x64": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-macos-x64.zip",
              "arm64": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-macos-x64.zip"
            },
            "linux": {
              "x64": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-linux-x64.zip",
              "x86": "https://github.com/tmedwards/tweego/releases/download/v2.1.1/tweego-2.1.1-linux-x86.zip"
            }
          },
          "storyFormats": {
            "sugarcube": {
              "version": "v2.37.3",
              "link": "https://github.com/tmedwards/sugarcube-2/releases/download/v2.37.3/sugarcube-2.37.3-for-twine-2.1-local.zip"
            }
          }
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('Created default config.json file');
    }
    
    const config = require('../config.json');
    const tweegoDirPath = path.resolve(__dirname, '../.tweego');

    // Ensure tweego directory exists
    if (!fs.existsSync(tweegoDirPath)) {
      fs.mkdirSync(tweegoDirPath, { recursive: true });
    }

    const formatDirPath = path.resolve(tweegoDirPath, 'storyformats');
    if (!fs.existsSync(formatDirPath)) {
      fs.mkdirSync(formatDirPath, { recursive: true });
    }

    await installTweego(config, tweegoDirPath);
    await installSugarCubeFormat(config, formatDirPath);
    
    console.log('Installation completed successfully!');
  } catch (error) {
    console.error('Error during installation:', error);
    process.exit(1);
  }
}

// Get Tweego download link based on platform and architecture
function getTweegoZipLink(config) {
  const platformName = process.platform;
  const archName = process.arch === 'x64' ? 'x64' : 
                 (process.arch === 'arm64' && platformName === 'darwin' ? 'arm64' : 'x86');
  
  const binaries = config.tweego.binaries[platformName];
  return binaries[archName] || binaries.x86;
}

// Download file using native https and fs modules
async function downloadFile(url, dest) {
  console.log(`Downloading ${url}...`);
  
  // Remove the file if it exists
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  
  const file = fs.createWriteStream(dest);
  
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        file.close();
        downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => resolve());
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Extract zip file safely
async function extractZip(zipPath, destPath) {
  console.log(`Extracting ${zipPath} to ${destPath}...`);
  
  // Ensure the destination exists
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
  
  try {
    if (process.platform === 'win32') {
      // Wait for file to be fully closed before extraction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use PowerShell to extract
      execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`, { 
        stdio: 'inherit',
        // Increase max buffer size
        maxBuffer: 10 * 1024 * 1024 
      });
    } else {
      // For Unix systems, try using unzip
      execSync(`unzip -o "${zipPath}" -d "${destPath}"`, { 
        stdio: 'inherit',
        // Increase max buffer size
        maxBuffer: 10 * 1024 * 1024 
      });
    }
    
    // Clean up zip file after successful extraction
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    
    console.log(`Extraction of ${zipPath} completed successfully.`);
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    throw new Error('ZIP extraction failed');
  }
}

async function installTweego(config, tweegoDirPath) {
  console.log('Installing Tweego...');
  
  try {
    const zipLink = getTweegoZipLink(config);
    const zipPath = path.resolve(__dirname, '../.tweego.zip');
    
    await downloadFile(zipLink, zipPath);
    await extractZip(zipPath, tweegoDirPath);
    
    // Make tweego executable on Unix-like systems
    if (['darwin', 'linux'].includes(process.platform)) {
      const tweegoBinPath = path.resolve(tweegoDirPath, 'tweego');
      fs.chmodSync(tweegoBinPath, '755');
    }
    
    console.log('Tweego installed successfully');
  } catch (error) {
    console.error('Failed to install Tweego:', error);
    throw error;
  }
}

async function installSugarCubeFormat(config, formatDirPath) {
  console.log('Installing SugarCube format...');
  
  try {
    const zipLink = config.tweego.storyFormats.sugarcube.link;
    const zipPath = path.resolve(__dirname, '../.sugarcube.zip');
    
    await downloadFile(zipLink, zipPath);
    await extractZip(zipPath, formatDirPath);
    
    console.log('SugarCube format installed successfully');
  } catch (error) {
    console.error('Failed to install SugarCube format:', error);
    throw error;
  }
}

// Run the main function
main().catch(err => {
  console.error('Installation failed:', err);
  process.exit(1);
});
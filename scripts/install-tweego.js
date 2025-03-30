const fs = require('fs');
const path = require('path');
const https = require('https');
const { createWriteStream, unlinkSync, mkdirSync, chmodSync } = fs;
const { resolve } = path;
const { platform, arch } = process;

// Check for config.json
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
  const tweegoDirPath = resolve(__dirname, '../.tweego');

  // Ensure tweego directory exists
  if (!fs.existsSync(tweegoDirPath)) {
    fs.mkdirSync(tweegoDirPath, { recursive: true });
  }

  // Get Tweego download link based on platform and architecture
  function getTweegoZipLink() {
    const platformName = platform;
    const archName = arch === 'x64' ? 'x64' : 
                   (arch === 'arm64' && platformName === 'darwin' ? 'arm64' : 'x86');
    
    const binaries = config.tweego.binaries[platformName];
    return binaries[archName] || binaries.x86;
  }

  // Download file using native https and fs modules
  function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      console.log(`Downloading ${url}...`);
      const file = createWriteStream(dest);
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects
          downloadFile(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        unlinkSync(dest);
        reject(err);
      });
    });
  }

  // Extract zip file using a simple native approach
  async function extractZip(zipPath, destPath) {
    // For Windows, use PowerShell to extract
    if (platform === 'win32') {
      const { execSync } = require('child_process');
      try {
        console.log(`Extracting ${zipPath} to ${destPath}...`);
        execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`, { stdio: 'inherit' });
        return;
      } catch (error) {
        console.error('PowerShell extraction failed, trying alternative method...');
      }
    }
    
    // For Unix systems, try using unzip
    try {
      const { execSync } = require('child_process');
      console.log(`Extracting ${zipPath} to ${destPath}...`);
      execSync(`unzip -o "${zipPath}" -d "${destPath}"`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      console.error('Please manually extract the ZIP file or install the decompress package:');
      console.error('npm install decompress --save-dev');
      throw new Error('ZIP extraction failed');
    }
  }

  async function installTweego() {
    console.log('Installing Tweego...');
    
    try {
      const zipLink = getTweegoZipLink();
      const zipPath = resolve(__dirname, '../.tweego.zip');
      
      await downloadFile(zipLink, zipPath);
      await extractZip(zipPath, tweegoDirPath);
      
      // Clean up zip file
      unlinkSync(zipPath);
      
      // Make tweego executable on Unix-like systems
      if (['darwin', 'linux'].includes(platform)) {
        const tweegoBinPath = resolve(tweegoDirPath, 'tweego');
        chmodSync(tweegoBinPath, '755');
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
      const zipPath = resolve(__dirname, '../.sugarcube.zip');
      const formatDir = resolve(tweegoDirPath, 'storyformats');
      
      // Ensure storyformats directory exists
      if (!fs.existsSync(formatDir)) {
        fs.mkdirSync(formatDir, { recursive: true });
      }
      
      await downloadFile(zipLink, zipPath);
      await extractZip(zipPath, formatDir);
      
      // Clean up zip file
      unlinkSync(zipPath);
      
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
  
} catch (error) {
  console.error('Error running install script:', error);
  console.error('Hint: Install the required dependencies or manually setup Tweego');
  console.error('npm install decompress cross-spawn --save-dev');
  process.exit(1);
}
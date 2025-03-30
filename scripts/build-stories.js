const spawn = require('cross-spawn');
const path = require('path');
const fs = require('fs');
const config = require('../config.json');

// Ensure output directory exists
const outputDir = path.resolve(__dirname, '../src/assets/stories');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get tweego binary path based on platform
function getTweegoBinaryPath() {
  const tweegoBinaries = {
    win32: path.resolve(__dirname, '../.tweego/tweego.exe'),
    darwin: path.resolve(__dirname, '../.tweego/tweego'),
    linux: path.resolve(__dirname, '../.tweego/tweego')
  };
  
  return tweegoBinaries[process.platform] || tweegoBinaries.linux;
}

// Run tweego for each story directory
fs.readdirSync(path.resolve(__dirname, '../src/stories'))
  .filter(file => fs.statSync(path.resolve(__dirname, '../src/stories', file)).isDirectory())
  .forEach(storyDir => {
    const inputDir = path.resolve(__dirname, '../src/stories', storyDir);
    const outputFile = path.resolve(outputDir, `${storyDir}.html`);
    
    console.log(`Building story: ${storyDir}`);
    
    // Build using tweego
    const result = spawn.sync(
      getTweegoBinaryPath(), 
      [
        '--output=' + outputFile,
        inputDir
      ],
      {
        env: { 
          ...process.env, 
          TWEEGO_PATH: path.resolve(__dirname, '../.tweego/storyformats') 
        },
        stdio: 'inherit'
      }
    );
    
    if (result.status !== 0) {
      console.error(`Failed to build story: ${storyDir}`);
      process.exit(1);
    }
  });

console.log('All stories built successfully');
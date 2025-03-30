const path = require("path");
const fs = require("fs");
const { execSync, spawn } = require("child_process");

// Check for config.json
try {
  const configPath = path.resolve(__dirname, "../config.json");
  if (!fs.existsSync(configPath)) {
    console.error(
      "config.json not found. Run the install-tweego script first."
    );
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.resolve(__dirname, "../src/assets/stories");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get tweego binary path based on platform
  function getTweegoBinaryPath() {
    const tweegoBinaries = {
      win32: path.resolve(__dirname, "../.tweego/tweego.exe"),
      darwin: path.resolve(__dirname, "../.tweego/tweego"),
      linux: path.resolve(__dirname, "../.tweego/tweego"),
    };

    return tweegoBinaries[process.platform] || tweegoBinaries.linux;
  }

  function spawnProcess(command, args, options) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, options);

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Command failed with code ${code}`));
        } else {
          resolve();
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  // Check if the stories directory exists
  const storiesDir = path.resolve(__dirname, "../src/stories");
  if (!fs.existsSync(storiesDir)) {
    console.log("Creating stories directory...");
    fs.mkdirSync(storiesDir, { recursive: true });

    // Create a sample story
    const sampleStoryDir = path.resolve(storiesDir, "mystory");
    fs.mkdirSync(sampleStoryDir, { recursive: true });

    // Create a sample StoryData.twee file
    const storyDataContent = `:: StoryData
{
  "ifid": "1234567890ABCDEF",
  "format": "SugarCube",
  "format-version": "2.36.1",
  "start": "Start"
}`;
    fs.writeFileSync(
      path.resolve(sampleStoryDir, "StoryData.twee"),
      storyDataContent
    );

    // Create a sample Start.twee file
    const startPassageContent = `:: Start
# Welcome to your SugarCube story

This is the starting passage of your interactive story.

[[Go to another passage->Second Passage]]

:: Second Passage
You've reached the second passage.

[[Return to start->Start]]`;
    fs.writeFileSync(
      path.resolve(sampleStoryDir, "Start.twee"),
      startPassageContent
    );

    console.log("Created sample story in src/stories/mystory/");
  }

  // Run tweego for each story directory
  async function buildStories() {
    const tweegoBinary = getTweegoBinaryPath();

    if (!fs.existsSync(tweegoBinary)) {
      console.error(`Tweego not found at ${tweegoBinary}`);
      console.error("Please run the install-tweego script first");
      process.exit(1);
    }

    try {
      const directories = fs
        .readdirSync(path.resolve(__dirname, "../src/stories"))
        .filter((file) =>
          fs
            .statSync(path.resolve(__dirname, "../src/stories", file))
            .isDirectory()
        );

      if (directories.length === 0) {
        console.log("No story directories found in src/stories/");
        return;
      }

      for (const storyDir of directories) {
        const inputDir = path.resolve(__dirname, "../src/stories", storyDir);
        const outputFile = path.resolve(outputDir, `${storyDir}.html`);

        console.log(`Building story: ${storyDir}`);

        try {
          // Build using tweego - use child_process directly
          const tweego = tweegoBinary;
          const args = ["--output=" + outputFile, inputDir];
          const env = {
            ...process.env,
            TWEEGO_PATH: path.resolve(__dirname, "../.tweego/storyformats"),
          };

          if (process.platform === "win32") {
            // For Windows, use spawn
            await spawnProcess(tweego, args, { env, stdio: "inherit" });
          } else {
            // For Unix, make sure it's executable
            try {
              fs.chmodSync(tweego, "755");
            } catch (e) {
              console.log(
                "Could not make tweego executable, it might already be."
              );
            }

            // Use execSync for simplicity
            execSync(`"${tweego}" --output="${outputFile}" "${inputDir}"`, {
              env,
              stdio: "inherit",
            });
          }

          console.log(`Successfully built: ${storyDir}`);
        } catch (error) {
          console.error(`Failed to build story: ${storyDir}`);
          console.error(error);
          process.exit(1);
        }
      }

      console.log("All stories built successfully");
    } catch (error) {
      console.error("Failed to build stories:", error);
      process.exit(1);
    }
  }

  buildStories();
} catch (error) {
  console.error("Error running build script:", error);
  process.exit(1);
}

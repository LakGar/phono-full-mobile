const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const convertSvgToPng = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath).resize(200, 200).png().toFile(outputPath);
    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
};

const generateImages = async () => {
  const defaultsDir = path.join(__dirname, "../assets/images/defaults");
  const avatarsDir = path.join(__dirname, "../assets/images/avatars");

  // Convert default images
  await convertSvgToPng(
    path.join(defaultsDir, "default-artist.svg"),
    path.join(defaultsDir, "default-artist.png")
  );
  await convertSvgToPng(
    path.join(defaultsDir, "default-album.svg"),
    path.join(defaultsDir, "default-album.png")
  );

  // Convert all avatar images
  for (let i = 1; i <= 3; i++) {
    await convertSvgToPng(
      path.join(avatarsDir, `avatar${i}.svg`),
      path.join(avatarsDir, `avatar${i}.png`)
    );
  }
};

generateImages().catch(console.error);

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const replaceColorWithSolid = (inputPath, outputPath, color) => {
  sharp(inputPath)
    .metadata()
    .then((metadata) => {
      const { width, height } = metadata;
      const text = `${width} x ${height}`;
      const fontSize = Math.min(width, height) * 0.1;

      return sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: color,
        },
      })
        .composite([
          {
            input: Buffer.from(`
              <svg width="${width}" height="${height}">
                <rect x="0" y="0" width="${width}" height="${height}" fill="none"/>
                <text x="50%" y="50%" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" fill="#8b8b8b" dy=".3em">
                  ${text}
                </text>
              </svg>
            `),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toFile(outputPath);
    })
    .catch((err) => {
      console.error(`Error processing image ${inputPath}:`, err);
    });
};

const processImages = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error reading file ${filePath}:`, err);
          return;
        }

        if (stats.isDirectory()) {
          processImages(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          const supportedFormats = [".png", ".jpg", ".jpeg", ".webp"];

          if (supportedFormats.includes(ext)) {
            const outputFilePath = filePath;
            replaceColorWithSolid(filePath, outputFilePath, {
              r: 211,
              g: 211,
              b: 211,
              alpha: 1,
            });
            console.log(`Processed: ${filePath}`);
          }
        }
      });
    });
  });
};

const inputDirectory = path.join(__dirname, "images");
processImages(inputDirectory);

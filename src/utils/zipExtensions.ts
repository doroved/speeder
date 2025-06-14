import * as fs from "node:fs";
import archiver from "archiver";

// Paths
const chromeDir = Bun.pathToFileURL("extension/chrome/").pathname;
const firefoxDir = Bun.pathToFileURL("extension/firefox/").pathname;
const releaseDir = Bun.pathToFileURL("extension/releases/").pathname;

// Ensure the release directory exists
fs.mkdirSync(releaseDir, { recursive: true });

// Function to zip a directory
function zipDirectory(source: string, out: string) {
  const output = fs.createWriteStream(out);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level
  });

  output.on("close", () => {
    const archiveSize = (archive.pointer() / 1024).toFixed(2);
    const archiveName = out.substring(out.lastIndexOf("/") + 1);

    const formattedPath = `\x1b[38;5;250mextension/releases/\x1b[0m${archiveName}`;
    const formattedSize = `\x1b[38;5;250m${archiveSize} kB\x1b[0m`;

    console.log(`${formattedPath}\t${formattedSize}`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(source, false);
  archive.finalize();
}

// Read version from manifest.json using Bun
async function getVersion(manifestPath: string): Promise<string> {
  const file = Bun.file(manifestPath);
  const manifest = await file.json();
  return manifest.version;
}

// Perform zipping
async function createZips() {
  const chromeVersion = await getVersion("extension/chrome/manifest.json");
  const firefoxVersion = await getVersion("extension/firefox/manifest.json");

  const chromeZip = `${releaseDir}speeder-chrome-v${chromeVersion}.zip`;
  const firefoxZip = `${releaseDir}speeder-firefox-v${firefoxVersion}.zip`;

  zipDirectory(chromeDir, chromeZip);
  zipDirectory(firefoxDir, firefoxZip);
}

// Execute the function
createZips().catch(console.error);

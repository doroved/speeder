# Project Description

This project is a Chrome browser extension that allows users to control the playback speed of videos on YouTube. The extension helps users enjoy videos comfortably by adjusting the playback speed from 0.1x to 16x.

## Installation from Web Store
[![Install from Chrome Web Store](available_chrome.png)](https://chrome.google.com/webstore/detail/hkhfaempiaejenaddpbeckghomphjjcp)

## Key Features:
- Set playback speed using a slider.
- Quickly reset playback speed with a double-click on the slider.
- Automatically hide the slider while viewing the timestamps on the progress bar to avoid distractions during video playback.
- Store preset speeds for each channel. (In the next update)

## Developer Information
- **Technologies:** TypeScript, HTML, CSS.
- **Libraries Used:** [Bun](https://bun.sh/) for building and managing dependencies.
- **Project Structure:** The code is split into several files, including the main script file and a set of styles.

## Installation and Build
1. Clone the repository from GitHub:
   `git clone https://github.com/doroved/speeder`
2. Navigate to the project directory:
   `cd speeder`
3. Install dependencies if necessary:
   `bun install`
4. Build the project for production:
   `bun run build`
5. For development use:
   `bun build:dev`
6. To package the extension into a zip file:
   `bun build:release`

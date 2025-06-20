import type { OutputOptions } from "rollup";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === "development" ? "inline" : false,
      rollupOptions: {
        input: {
          main: "./src/app.ts",
          // sw: "./src/sw.ts",
          css: "./src/assets/app.css",
        },
        output: [
          {
            dir: "extension/chrome/src",
            ...getOutputOptions(),
          },
          {
            dir: "extension/firefox/src",
            ...getOutputOptions(),
          },
        ],
      },
    },
  };
});

const getOutputOptions = (): OutputOptions => {
  return {
    entryFileNames: (chunkInfo) => {
      return chunkInfo.name === "sw" ? "sw.js" : "app.js";
    },
    assetFileNames: "app.css",
  };
};

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const packageJson = require("./package.json");

// https://vitejs.dev/config/
export default defineConfig((configEnv) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#big-list-of-options
      input: "src/index.ts",
      output: [
        {
          format: "cjs",
          entryFileNames: packageJson.main,
        },
        {
          format: "esm",
          entryFileNames: packageJson.module,
        },
      ],
    },
  },
}));

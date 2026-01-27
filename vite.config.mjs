import crypto from "crypto";

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import pkg from "./package.json";

const buildHash = crypto.randomBytes(8).toString("hex");

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_HASH__: JSON.stringify(buildHash),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    mainFields: ["browser", "module", "jsnext:main", "jsnext"],
  },
  plugins: [
    react(),
    tsconfigPaths(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
});

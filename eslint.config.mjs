import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";

// Browser globals used by this app (avoids an extra 'globals' dependency)
const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  console: "readonly",
  fetch: "readonly",
  Request: "readonly",
  Response: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  Blob: "readonly",
  File: "readonly",
  FileReader: "readonly",
  FormData: "readonly",
  Image: "readonly",
  ImageData: "readonly",
  ImageDecoder: "readonly",
  CanvasRenderingContext2D: "readonly",
  HTMLCanvasElement: "readonly",
  HTMLVideoElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLElement: "readonly",
  Event: "readonly",
  KeyboardEvent: "readonly",
  DragEvent: "readonly",
  ClipboardEvent: "readonly",
  Promise: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  requestAnimationFrame: "readonly",
  cancelAnimationFrame: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  history: "readonly",
  location: "readonly",
  alert: "readonly",
  AbortController: "readonly",
  Headers: "readonly",
  performance: "readonly",
  structuredClone: "readonly",
  WebAssembly: "readonly",
};

export default ts.config(
  {
    // Only lint the main app — the other folders are separate self-contained
    // mini-projects (own package.json / build) that are vendored here.
    ignores: [
      "dist/**",
      "node_modules/**",
      "rss-video-generator/**",
      "new web based tools ( Acetools.com)/**",
      "The 99 Deals/**",
      "pdf-backend/.venv/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ["src/**/*.{ts,tsx}", "*.mjs", "*.cjs"],
    languageOptions: {
      globals: browserGlobals,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-useless-assignment": "off", // pattern used intentionally for defaults
    },
  }
);
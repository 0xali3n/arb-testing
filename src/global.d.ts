// Extend the global Window interface to support the ethereum property
export {};

declare global {
  interface Window {
    ethereum?: any;
    global?: any; // Add global property
  }
}

// Polyfill for global in browser
if (typeof window !== "undefined") {
  (window as any).global = window;
  (window as any).process = { env: {} }; // Some packages might need process
  (window as any).Buffer = window.Buffer || require("buffer").Buffer;
}

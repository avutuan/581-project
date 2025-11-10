// Import defineConfig helper to provide typed config and plugin integration.
import { defineConfig } from 'vite';
// Import the official React plugin (adds fast refresh, JSX transform, etc.).
import react from '@vitejs/plugin-react';

// Export the Vite configuration object. Using defineConfig for improved DX.
export default defineConfig({
  // Register plugins (React for JSX and HMR).
  plugins: [react()],
  // Development server options.
  server: {
    // Automatically open the app in the default browser when `npm run dev` starts.
    open: true
  }
});

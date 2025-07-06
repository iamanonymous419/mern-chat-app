import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // 👈 ensures consistent origin
    port: 5173, // optional, default is 5173
  },
});

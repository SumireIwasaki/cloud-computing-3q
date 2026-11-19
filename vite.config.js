import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        signup: resolve(import.meta.dirname, 'signup.html'),
        user: resolve(import.meta.dirname, 'user.html'),
        memo:resolve(import.meta.dirname,'memo.html'),
      },
    },
  },
});
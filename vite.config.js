import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/cloud-computing-3q/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        signup: resolve(import.meta.dirname, 'signup.html'),
        todo: resolve(import.meta.dirname, 'todo.html'),
      },
    },
  },
});
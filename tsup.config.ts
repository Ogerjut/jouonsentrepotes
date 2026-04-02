import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.ts'],
  format: ['esm'],
  outDir: 'dist-server',
  external: ['./build/handler.js', '../build/handler.js'],
  noExternal: []
});
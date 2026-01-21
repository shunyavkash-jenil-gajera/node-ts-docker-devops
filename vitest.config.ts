import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,  // Yeh line sabse important – describe, it, expect global ban jaayenge
    environment: 'node',  // Backend Node.js ke liye
    include: ['src/**/*.test.ts'],  // Tumhare test files ko pick karega
    // Optional: agar chahiye toh
    // setupFiles: ['./src/setupTests.ts'], // baad mein agar extra setup chahiye
  },
});
#!/usr/bin/env node
import('./index.ts').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

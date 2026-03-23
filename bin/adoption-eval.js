#!/usr/bin/env node
import { runCli } from '../dist/cli.js';

runCli(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(`[fatal] ${err?.message || err}`);
    process.exitCode = 1;
  });

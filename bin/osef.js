#!/usr/bin/env node

import("../lib/index.js")
  .then(({ default: cleaner }) => cleaner({ cwd: process.cwd() }))
  .then((success) => {
    if (success) {
      process.stdout.write("Success!\n");
    } else {
      process.stderr.write("Error: cleaner failed\n");
    }
  })
  .catch(
    /**
     * @param {Error} err
     */
    (err) => {
      process.stderr.write(`Error: ${err.message}\n`);
    }
  );

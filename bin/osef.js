#!/usr/bin/env node

import("../lib/index.js")
  .then(({ default: cleaner }) => cleaner({ cwd: process.cwd() }))
  .then((success) => {
    if (success) {
      console.log("Success!\n");
    } else {
      console.error("Error: cleaner failed\n");
    }
  })
  .catch(
    /**
     * @param {Error} err
     */
    (err) => {
      console.error(`Error: ${err.message}\n`);
    }
  );

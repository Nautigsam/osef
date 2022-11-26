#!/usr/bin/env node
/* eslint-disable no-magic-numbers */

import { argv, exit } from "node:process";

import("../lib/index.js")
  .then(async ({ default: run, check }) => {
    if (argv[2] === "--checkprocess") {
      const success = await check(argv.slice(3));
      return { checkprocess: true, success };
    }
    const success = await run({ cwd: process.cwd() });
    return { checkprocess: false, success };
  })
  .then(({ checkprocess, success }) => {
    if (checkprocess) {
      if (success) {
        exit(0);
      } else {
        exit(1);
      }
    } else if (success) {
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
      exit(1);
    }
  );

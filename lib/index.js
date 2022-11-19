import lintStaged from "lint-staged";

const eslintrc = new URL("../.eslintrc.json", import.meta.url).pathname;

/**
 * @param {Options} options
 */
export default function cleaner({ cwd }) {
  return lintStaged({
    config: {
      "*.{js,jsx,ts,tsx}": [
        `eslint --fix --config ${eslintrc} --no-eslintrc`,
        "tsc --noEmit --allowJs --checkJs --strict --module esnext",
        "prettier --write",
      ],
      "*.{json,jsonc,md,html,css,yaml,yml}": "prettier --write",
    },
    cwd,
    verbose: true,
  });
}

/**
 * @typedef {object} Options
 * @property {string} cwd
 */

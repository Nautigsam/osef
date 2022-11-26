/* eslint-disable max-statements */
/* eslint-disable no-magic-numbers */
import { readFile, writeFile } from "node:fs/promises";
import { ESLint } from "eslint";
import { createRequire } from "node:module";
import lintStaged from "lint-staged";
import prettier from "prettier";
import ts from "typescript";

const jsExtensions = [
  ".js",
  ".ts",
  ".d.ts",
  ".jsx",
  ".tsx",
  ".cjs",
  ".mjs",
  ".cts",
  ".mts",
  ".d.cts",
  ".d.mts",
];

const lintStagedDefinition = new URL("../lint-staged.d.ts", import.meta.url)
  .pathname;

/**
 * @param {{cwd: string}} options
 */
export default function run({ cwd }) {
  return lintStaged({
    config: {
      "*": "osef --checkprocess",
    },
    cwd,
    verbose: true,
  });
}

/**
 * @param {string[]} files
 */
async function checkPrettier(files) {
  await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, { encoding: "utf-8" });
      const data = prettier.format(source, { filepath: file });
      return writeFile(file, data, { encoding: "utf-8" });
    })
  );
}

/**
 * @param {string[]} files
 */
async function checkEslint(files) {
  const cwd = new URL("..", import.meta.url);
  const eslint = new ESLint({
    cwd: cwd.pathname,
    fix: true,
    globInputPaths: false,
  });

  const results = await eslint.lintFiles(files);
  const notFixed = results.filter(
    (res) =>
      res.errorCount > res.fixableErrorCount ||
      res.warningCount > res.fixableWarningCount
  );

  if (!notFixed.length) {
    return true;
  }
  const formatter = await eslint.loadFormatter();
  const resultStr = await formatter.format(notFixed);
  console.error(resultStr);

  const errorsCount = notFixed.reduce(
    (count, result) => count + result.errorCount,
    0
  );
  if (errorsCount > 0) {
    return false;
  }
  return true;
}

/**
 * @param {string[]} files
 */
function checkTs(files) {
  const program = ts.createProgram([lintStagedDefinition, ...files], {
    allowJs: true,
    checkJs: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    resolveJsonModule: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  for (const diagnostic of diagnostics) {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        /** @type {number} */ (diagnostic.start)
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.error(
        `${diagnostic.file.fileName}:${line + 1}:${
          character + 1
        }: ${message} (${diagnostic.code})`
      );
    } else {
      console.error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  }
  return diagnostics.length === 0;
}

/**
 * @param {string[]} files
 */
export async function check(files) {
  const require = createRequire(import.meta.url);
  const CSS = require("linguist-languages/data/CSS.json");
  const JSON = require("linguist-languages/data/JSON.json");
  const JSON5 = require("linguist-languages/data/JSON5.json");
  const JSONC = require("linguist-languages/data/JSON with Comments.json");
  const otherExtensions = [
    ...CSS.extensions,
    ...JSON.extensions.filter((extension) => extension !== ".jsonl"),
    ...JSONC.extensions,
    ...JSON5.extensions,
  ];

  /** @type {string[]} */
  const jsFiles = [];
  /** @type {string[]} */
  const otherFiles = [];
  for (const file of files) {
    if (jsExtensions.some((ext) => file.endsWith(ext))) {
      jsFiles.push(file);
    } else if (otherExtensions.some((ext) => file.endsWith(ext))) {
      otherFiles.push(file);
    }
  }
  const eslintSuccess = await checkEslint(jsFiles);
  if (!eslintSuccess) return eslintSuccess;
  const tsSuccess = checkTs(jsFiles);
  if (!tsSuccess) return tsSuccess;
  await checkPrettier([...jsFiles, ...otherFiles]);
  return true;
}

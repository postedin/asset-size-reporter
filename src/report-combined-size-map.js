'use strict';

const { basename, dirname } = require('path');
const chalk = require('chalk');

const prettyBytes = require('./pretty-bytes');
const sumSizes = require('./sum-sizes');

module.exports = (combined, { console }) => {
  let sumAfter = { raw: 0, gzip: null, brotli: null };
  let sumBefore = { raw: 0, gzip: null, brotli: null };

  for (let path of Object.keys(combined)) {
    let after = combined[path].after;
    let before = combined[path].before;

    if (after !== undefined) {
      sumAfter = sumSizes(sumAfter, after);
    }

    if (before !== undefined) {
      sumBefore = sumSizes(sumBefore, before);
    }

    let output = formatLine(path, before, after);

    console.log(output);
  }

  let output = formatLine('Total', sumBefore, sumAfter);
  console.log();
  console.log(output);
};

function formatLine(path, before, after) {
  let added = before === undefined;
  let deleted = after === undefined;

  let output = path === 'Total'
    ? chalk`{bold Total}{dim :} `
    : formatPathPrefix(path, { deleted });

  if (deleted) {
    // file was deleted
    output += formatDiff(before.raw);
    if (before.gzip !== null) {
      output += ` / gzip ${formatDiff(before.gzip)}`;
    }
    output += ` (deleted file)`;

    output = chalk.gray(output);

  } else if (added) {
    // file was added
    output += formatDiff(after.raw);
    if (after.gzip !== null) {
      output += ` / gzip ${formatDiff(after.gzip)}`;
    }
    output += ` (new file)`;

    output = chalk.blue(output);

  } else {
    // file was modified
    output += formatDiff(before.raw, after.raw);
    if (before.gzip !== null && after.gzip !== null) {
      output += ` / gzip ${formatDiff(before.gzip, after.gzip)}`;
    }

    if (before.raw > after.raw) {
      output = chalk.green(output);
    } else if (before.raw < after.raw) {
      output = chalk.red(output);
    }
  }

  return output;
}

function formatPathPrefix(path, { deleted } = {}) {
  let dir = dirname(path);
  let base = basename(path);
  return chalk`${deleted ? '[' : ''}{dim ${dir}/}${base}${deleted ? ']' : ''}{dim :} `;
}

function formatDiff(before, after = before) {
  if (before === after) {
    return prettyBytes(after);
  }

  return `${prettyBytes(before)} -> ${prettyBytes(after)} (${prettyBytes(after - before, { signed: true })})`;
}

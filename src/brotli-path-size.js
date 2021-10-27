'use strict';

const execa = require('execa');
const Counter = require('passthrough-counter');

module.exports = async (path, { level } = {}) => new Promise((resolve, reject) => {
  const { stdout } = execa('brotli', ['-c', `-${level !== undefined ? level : 'Z'}`, path]);
  
  stdout.on('error', reject);
  stdout.pipe(Counter).on('finish', function() {
    resolve(this.length);
  });
});

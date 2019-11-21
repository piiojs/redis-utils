#!/usr/bin/env node

/* eslint no-console: "off" */

const Redis = require('ioredis');
const fs = require('fs');
const { argv } = require('yargs')
  .default('h', '127.0.0.1')
  .default('p', 6379)
  .default('pattern', '*')
  .default('filename', 'dump.json');

const host = argv.h;
const port = argv.p;
const { pattern } = argv;
const { filename } = argv;

let roundCount = 0;
let hashesCount = 0;
let sep = '';
const startTime = new Date();

const redis = new Redis({
  host,
  port
});

// Delete previous file
if (fs.existsSync(filename)) {
  fs.unlinkSync(filename);
}

// Create new fil with '['
const fd = fs.openSync(filename, 'a');

fs.appendFileSync(fd, '[', 'utf8');

// Start scanning
const stream = redis.scanStream({
  match: pattern,
  count: 10000
});

console.log(`\n*********** START SCANNING FOR PATTERN ${pattern} ***********`);

stream.on('data', (resultKeys) => {
  roundCount += 1;
  console.log(`\nFound ${resultKeys.length} keys on this round. Round count: ${roundCount}`);
  // Check if we have something to get
  if (resultKeys.length > 0) {
    // Pause scanning
    stream.pause();
    const hashes = {};
    console.log('Getting values');
    redis.mget(resultKeys)
      .then((resultValues) => {
        console.log(`Got ${resultValues.length} values`);
        for (let i = 0; i < resultKeys.length; i++) {
          hashes[resultKeys[i]] = resultValues[i];
        }
        hashesCount += resultKeys.length;

        // Write the object to file
        console.log('Write hashes to file');
        fs.appendFileSync(fd, sep + JSON.stringify(hashes), 'utf8');
        sep = ',';

        // Resume scanning
        stream.resume();
      })
      .catch((reason) => {
        console.log(`Error on mget: ${reason}`);
        process.exit(1);
      });
  }
});
stream.on('end', () => {
  console.log('\n*********** SCAN FINISHED ***********');

  // Close file
  fs.appendFileSync(fd, ']', 'utf8');
  if (fd !== undefined) {
    fs.closeSync(fd);
  }

  // Stop timer
  const executionTimeMs = new Date() - startTime;
  const executionTimeStr = millisecondsToStr(executionTimeMs);

  // Summary
  console.log(`\nNumber of rounds: ${roundCount}`);
  console.log(`Number of hashes found: ${hashesCount}`);
  console.log(`Filename: ${filename}`);
  console.info(`Execution time: ${executionTimeStr}`);
  process.exit();
});

function millisecondsToStr(milliseconds) {
  function numberEnding(number) {
    return (number > 1) ? 's' : '';
  }

  let temp = Math.floor(milliseconds / 1000);

  const hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return `${hours} hour${numberEnding(hours)}`;
  }
  const minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return `${minutes} minute${numberEnding(minutes)}`;
  }
  const seconds = temp % 60;
  if (seconds) {
    return `${seconds} second${numberEnding(seconds)}`;
  }
  return 'Less than a second';
}

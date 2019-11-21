#!/usr/bin/env node

/* eslint no-console: "off" */

const Redis = require('ioredis');
const { argv } = require('yargs')
  .default('h', '127.0.0.1')
  .default('p', 6379)
  .default('pattern', '*')
  .default('time', 60 * 60 * 24 * 30 * 3); // 60 * 60 * 24 * 30 * 3

const host = argv.h;
const port = argv.p;
const { pattern } = argv;
const { time } = argv;

let roundCount = 0;
let hashesCount = 0;
const startTime = new Date();
const promises = [];

const redis = new Redis({
  host,
  port
});

// Start scanning
const stream = redis.scanStream({
  match: pattern,
  count: 10000
});

console.log(`\n*********** START SCANNING FOR PATTERN ${pattern} ***********`);

stream.on('data', (resultKeys) => {
  roundCount += 1;
  hashesCount += resultKeys.length;
  console.log(`\nFound ${resultKeys.length} keys on this round. Round count: ${roundCount}`);
  // Pause scanning
  stream.pause();

  console.log('Setting expire');
  for (let i = 0; i < resultKeys.length; i++) {
    promises.push(redis.expire(resultKeys[i], time));
  }

  // Resume scanning only when all expires are set
  Promise.all(promises)
    .then(() => {
      promises.length = 0;
      stream.resume();
    })
    .catch((err) => {
      console.log(err);

      const executionTimeMs = new Date() - startTime;
      const executionTimeStr = millisecondsToStr(executionTimeMs);
      console.info(`\nExecution time: ${executionTimeStr}`);

      process.exit(1);
    });
});
stream.on('end', () => {
  console.log('\n*********** SCAN FINISHED ***********');

  // Stop timer
  const executionTimeMs = new Date() - startTime;
  const executionTimeStr = millisecondsToStr(executionTimeMs);

  // Summary
  console.log(`\nNumber of rounds: ${roundCount}`);
  console.log(`Set expire on: ${hashesCount}`);
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

#!/usr/bin/env node

/* eslint no-console: "off" */

const Redis = require('ioredis');
const { argv } = require('yargs')
  .default('h', '127.0.0.1')
  .default('p', 6379)
  .default('a', '');

const host = argv.h;
const port = argv.p;
const auth = argv.a;

const startTime = new Date();
let oldestIdle = -1;
let pipeline;

const redis = new Redis({
  host: host,
  port: port,
  password: auth
});

// Start scanning
const stream = redis.scanStream({
  count: 10000
});

console.log('\n*********** START SCANNING ***********');

stream.on('data', (resultKeys) => {
  stream.pause();
  pipeline = redis.pipeline();
  for (let i = 0; i < resultKeys.length; i++) {
    pipeline.object('idletime', resultKeys[i]);
  }
  pipeline.exec()
    .then((idleTimes) => {
      for (let i = 0; i < idleTimes.length; i++) {
        oldestIdle = Math.max(oldestIdle, idleTimes[i][1]);
      }
      stream.resume();
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
});
stream.on('end', () => {
  console.log('\n*********** SCAN FINISHED ***********');

  // Stop timer
  const executionTimeMs = new Date() - startTime;
  const executionTimeStr = millisecondsToStr(executionTimeMs);

  // Summary
  console.log(`Oldest Idle: ${millisecondsToStr(oldestIdle * 1000)}`);
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

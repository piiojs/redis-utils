#!/usr/bin/env node

/* eslint no-console: "off" */

const Redis = require('ioredis');
const fs = require('fs');
const { parser } = require('stream-json/Parser');
const { argv } = require('yargs')
  .boolean('t')
  .default('h', '127.0.0.1')
  .default('p', 6379)
  .default('a', '')
  .default('t', false)
  .default('filename', 'dump.json');

const host = argv.h;
const port = argv.p;
const auth = argv.a;
const tls = argv.t;
const { filename } = argv;

const startTime = new Date();
let key;
let value;
let keysCount = 0;
const promises = [];

let redisConfig = {
  host: host,
  port: port,
  password: auth
}

if (tls === true) (
  redisConfig.tls = {}
)

const redis = new Redis(redisConfig);

const pipeline = fs.createReadStream(filename).pipe(parser());
pipeline.on('data', (data) => {
  switch (data.name) {
    case 'keyValue':
      key = data.value;
      break;
    case 'stringValue':
      ({ value } = data);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      keysCount += 1;
      process.stdout.write(`Adding ${keysCount} keys`);
      promises.push(redis.set(key, value));
      break;
      // no default
  }
});
pipeline.on('end', () => {
  console.log('end parsing');
  Promise.all(promises)
    .then((res) => {
      console.log(`Number of keys added: ${res.length}`);

      const executionTimeMs = new Date() - startTime;
      const executionTimeStr = millisecondsToStr(executionTimeMs);
      console.info(`\nExecution time: ${executionTimeStr}`);

      process.exit();
    })
    .catch((err) => {
      console.log(err);

      const executionTimeMs = new Date() - startTime;
      const executionTimeStr = millisecondsToStr(executionTimeMs);
      console.info(`\nExecution time: ${executionTimeStr}`);

      process.exit(1);
    });
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

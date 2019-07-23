const TIMEOUT = 5 * 60; // seconds

const Queue = require('bee-queue');
const queue = new Queue('validators');
var Redis = require("ioredis");

var redis = new Redis();

function createValidatorsJob() {
  const job = queue.createJob({})
  job.save();
  job.on('succeeded', (result) => {
    redis.set("validators", JSON.stringify(result))
    .then(result => {
      console.log(result);
      setTimeout(createValidatorsJob, TIMEOUT * 1000);
    })
    .catch(error => {
      console.log(error);
      setTimeout(createValidatorsJob, TIMEOUT * 1000);
    });
  });
}

createValidatorsJob();
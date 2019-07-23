const Queue = require('bee-queue');
const queue = new Queue('validators');

const client = require('./lib.js');

queue.process(async function (job) {
  console.log(`Processing job ${job.id}`);
  let validatorsArray = [];

  for(let validator of (await client.getAllValidators())) {
    validatorsArray.push( await client.completeValidator(validator) )
  }
  return validatorsArray;
});
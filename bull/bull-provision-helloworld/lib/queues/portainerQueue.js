const Queue = require('bull');
const returnValueQueue = new Queue('returnValueQueue', 'redis://localhost:6380');

returnValueQueue.process((job, done) => {
  setTimeout(() => {
    const { data } = job;
    console.log(data);
    done(null, { return: 'value return ?' });
  }, 1000);
});

module.exports = returnValueQueue;

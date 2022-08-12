const Queue = require('bull');
const lineQueue = new Queue('anotherQueue', 'redis://redis:6380');

lineQueue.process((job, done) => {
  setTimeout(() => {
    const { data } = job;
    console.log(data);
    done();
  }, 1000);
});

module.exports = lineQueue;

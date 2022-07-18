const Queue = require('bull');
const lineQueue = new Queue('line_queue', 'redis://localhost:6380');

lineQueue.process((job, done) => {
  setTimeout(() => {
    const { data } = job;
    console.log(data);
    done();
  }, 2000);
});

module.exports = lineQueue;

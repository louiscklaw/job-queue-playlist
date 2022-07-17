const Queue = require('bee-queue');

const queue = new Queue('express-example', {
  redis: {
    host: 'redis',
    port: 6379,
    db: 0,
    options: {},
  },
});

queue.on('ready', function () {
  queue.process(function (job, done) {
    console.log('processing job ' + job.id);
    setTimeout(function () {
      done(null, job.data.x + job.data.y);
    }, 10);
  });

  console.log('processing jobs...');
});

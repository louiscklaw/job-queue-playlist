const Queue = require('bee-queue');
const pingQueue = new Queue('ping', {
  redis: {
    host: 'redis',
    port: 6379,
    db: 0,
    options: {},
  },
});

const pongQueue = new Queue('pong', {
  redis: {
    host: 'redis',
    port: 6379,
    db: 0,
    options: {},
  },
});

pingQueue.process(function (job, done) {
  console.log('Pong received ping');
  pongQueue.createJob().save(function () {
    console.log('Pong sent back pong');
    done();
  });
});

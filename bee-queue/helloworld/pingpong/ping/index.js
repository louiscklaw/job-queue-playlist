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

pongQueue.process(function (job, done) {
  console.log(`Ping received back pong`);
  done();
});

const sendPing = function () {
  pingQueue.createJob().save(function () {
    console.log(`Ping sent ping`);
  });
};

sendPing();
setInterval(sendPing, 2000);

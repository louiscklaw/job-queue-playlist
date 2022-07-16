const express = require('express');
const Queue = require('bull');
const QueueMQ = require('bullmq');

const fs = require('fs');
const path = require('path');
const es = require('event-stream');

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const someQueue = new Queue('someQueueName', 'redis://redis:6380'); // if you have a special connection to redis.
const someOtherQueue = new Queue('someOtherQueueName', 'redis://redis:6380');
const lineQueue = new Queue('line_queue', 'redis://redis:6380');

const PATH_FILE = path.join(__dirname, 'data', 'epa_hap_daily_summary.csv');

// const queueMQ = new QueueMQ("queueMQName");

const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(someQueue),
    new BullAdapter(someOtherQueue),
    new BullAdapter(lineQueue),
    // new BullMQAdapter(queueMQ),
  ],
  serverAdapter: serverAdapter,
});

const app = express();

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// other configurations of your server

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6380 by default');
});

lineQueue.process((job, done) => {
  setTimeout(() => {
    const { data } = job;
    console.log(data);
    done();
  }, 2000);
});

const mainFunction = () => {
  fs.createReadStream(PATH_FILE, 'utf-8')
    .pipe(es.split())
    .on('data', (data) => {
      lineQueue.add({ data }, { attempts: 1 });
    });
};

mainFunction();

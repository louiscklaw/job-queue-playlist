const express = require('express');

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const lineQueue = require('./lib/queues/lineQueue');
const anotherQueue = require('./lib/queues/anotherQueue');

const app = express();
const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(lineQueue), new BullAdapter(anotherQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/allQueue', (req, res) => {
  for (i = 0; i < 2; i++) {
    lineQueue.add({ data: 'abcde' }, { attempts: 1 });
    anotherQueue.add({ data: '123321' }, { attempts: 1 });
  }
});

app.get('/lineQueue', (req, res) => {
  for (i = 0; i < 3; i++) {
    lineQueue.add({ data: 'abcde' }, { attempts: 1 });
  }
});

app.get('/anotherQueue', (req, res) => {
  for (i = 0; i < 3; i++) {
    anotherQueue.add({ data: '123321' }, { attempts: 1 });
  }
});

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6380 by default');
});

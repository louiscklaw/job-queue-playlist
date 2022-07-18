const express = require('express');

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const lineQueue = require('./lib/queues/lineQueue');
const anotherQueue = require('./lib/queues/anotherQueue');
const returnValueQueue = require('./lib/queues/returnValueQueue');

const routes = require('./routes');

const app = express();

// bull-board setup
const serverAdapter = new ExpressAdapter({ basePath: '/admin/queues' });

serverAdapter.setBasePath('/admin/queues');
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(lineQueue), new BullAdapter(anotherQueue), new BullAdapter(returnValueQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
// bull-board setup

routes(app);

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6380 by default');
});

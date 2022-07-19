const express = require('express');
const Queue = require('bull');

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const lineQueue = require('./lib/queues/lineQueue');
const anotherQueue = require('./lib/queues/anotherQueue');

const initReturnValueQueue = require('./queues/returnValueQueue');
const returnValueQueue = new Queue('returnValueQueue', 'redis://localhost:6380');

const initDockerOperationQueue = require('./queues/dockerOperationQueue');
const dockerOperationQueue = new Queue('dockerOperationQueue', 'redis://localhost:6380');

const routes = require('./routes');

const app = express();

// bull-board setup
const serverAdapter = new ExpressAdapter({ basePath: '/admin/queues' });

serverAdapter.setBasePath('/admin/queues');
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(lineQueue), new BullAdapter(anotherQueue), new BullAdapter(returnValueQueue), new BullAdapter(dockerOperationQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
// bull-board setup

// helloworld
routes(app);

// production queue
initReturnValueQueue(app, returnValueQueue);
initDockerOperationQueue(app, dockerOperationQueue);

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6380 by default');
});

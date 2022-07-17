const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const mainFunction = require('./queue/lineQueue/mainFunction');
const lineQueue = require('./queue/lineQueue/lineQueue');

const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(lineQueue)],
  serverAdapter: serverAdapter,
});

const app = express();

serverAdapter.setBasePath('/queues_dashboard');
app.use('/queues_dashboard', serverAdapter.getRouter());

app.get('/helloworld', (req, res) => {
  res.send('Hello World!');
});

app.post('/post_helloworld', (req, res) => {
  res.send('POST request to the homepage');
});

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/queues_dashboard');
  console.log('Make sure Redis is running on port 6380 by default');
});

mainFunction();

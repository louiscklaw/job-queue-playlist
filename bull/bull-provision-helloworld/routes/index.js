const lineQueue = require('../lib/queues/lineQueue');
const anotherQueue = require('../lib/queues/anotherQueue');
// const returnValueQueue = require('../lib/queues/returnValueQueue');

module.exports = function (app) {
  app.get('/helloworld', (req, res) => {
    res.send({ hello: 'world' });
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

  app.get('/allQueue', (req, res) => {
    for (i = 0; i < 2; i++) {
      lineQueue.add({ data: 'abcde' }, { attempts: 1 });
      anotherQueue.add({ data: '123321' }, { attempts: 1 });
    }
  });
};

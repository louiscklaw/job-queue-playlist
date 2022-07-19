const lineQueue = require('../lib/queues/lineQueue');
const anotherQueue = require('../lib/queues/anotherQueue');
// const returnValueQueue = require('../lib/queues/returnValueQueue');

module.exports = function (app) {
  app.get('/helloworld', (req, res) => {
    res.send({ hello: 'world' });
  });
};

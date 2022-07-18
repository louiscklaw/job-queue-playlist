const lineQueue = require('./lib/queues/lineQueue');

const mainFunction = () => {
  lineQueue.add({ data: 'abcde' }, { attempts: 1 });
};

mainFunction();

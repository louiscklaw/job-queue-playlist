const fetch = require('node-fetch');

module.exports = (app, queue) => {
  queue.process((job, done) => {
    var { name } = job.data;
    (async () => {
      await fetch(`http://localhost:3000/dockerOperationQueue?oper=suspend&stack_name=${name}`);
      done(null, { return: 'value return ?' });
    })();
  });

  app.get('/suspendStackQueue', (req, res) => {
    if (!req.query.name) {
      res.send({ status: 'error', message: 'name is required' });
      return;
    }

    queue.add({ name: req.query.name }, { attempts: 1 });
    res.send({ status: 'accepted' });
  });
};

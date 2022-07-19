const fetch = require('node-fetch');

module.exports = (app, queue) => {
  queue.process((job, done) => {
    var { name } = job.data;
    (async () => {
      await fetch(`http://localhost:3000/dockerOperationQueue?oper=create&stack_name=${name}`);

      done(null, { return: 'value return ?' });
    })();
  });

  app.get('/createStackQueue', (req, res) => {
    (async () => {
      if (!req.query.name) {
        res.send({ status: 'error', message: 'name is required' });
        return;
      }

      queue.add({ name: req.query.name }, { attempts: 1 });
      res.send({ status: 'accepted' });
    })();
  });
};

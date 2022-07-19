module.exports = (app, queue) => {
  queue.process((job, done) => {
    setTimeout(() => {
      const { data } = job;
      console.log(data);
      done(null, { return: 'value return ?' });
    }, 1000);
  });

  app.get('/dockerOperationQueue', (req, res) => {
    queue.add({ data: 'returnValueQueue' }, { attempts: 1 });
    res.send({ status: 'ok' });
  });
};

module.exports = (app, queue) => {
  queue.process((job, done) => {
    console.log(job.data);
    done(null, { return: 'value return ?' });
  });

  app.get('/createStackQueue', (req, res) => {
    queue.add({ data: 'createStackQueue' }, { attempts: 1 });
    res.send({ status: 'ok' });
  });
};

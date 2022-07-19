module.exports = function (app) {
  app.get('/helloworld', (req, res) => {
    res.send({ hello: 'world' });
  });
};

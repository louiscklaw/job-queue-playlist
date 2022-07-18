var express = require('express');
var app = express();

var Agenda = require('agenda');
var Agendash = require('agendash');

const mongoConnectionString = 'mongodb://root:example@localhost:27017/';
const agenda = new Agenda({ db: { address: mongoConnectionString } });

app.use('/dash', Agendash(agenda));

app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/dash');
});

// agenda body

async function graceful() {
  console.log('hello stop');
  await agenda.stop();
  process.exit(0);
}

agenda.define('5 seconds passed', async (job) => {
  console.log('hello 5 seconds');
});

(async function () {
  // IIFE to give access to async/await
  await agenda.start();
  console.log('started');

  await agenda.every('5 seconds', '5 seconds passed');
})();

console.log('helloworld');
process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

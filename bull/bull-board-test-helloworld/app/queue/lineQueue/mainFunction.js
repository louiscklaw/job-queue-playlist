const express = require('express');
const Queue = require('bull');
const QueueMQ = require('bullmq');

const fs = require('fs');
const path = require('path');
const es = require('event-stream');

const FUNC_DIR = __dirname;
const APP_DIR = FUNC_DIR + '/..';
const PROJ_HOME = APP_DIR + '/..';
const DATA_DIR = PROJ_HOME + '/data';
const PATH_FILE = path.join(DATA_DIR, 'epa_hap_daily_summary.csv');

const lineQueue = require('./lineQueue');

const mainFunction = () => {
  fs.createReadStream(PATH_FILE, 'utf-8')
    .pipe(es.split())
    .on('data', (data) => {
      lineQueue.add({ data }, { attempts: 1 });
    });
};

module.exports = mainFunction;

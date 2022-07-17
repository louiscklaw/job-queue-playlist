const express = require('express');
const Queue = require('bull');
const QueueMQ = require('bullmq');

const fs = require('fs');
const path = require('path');
const es = require('event-stream');

// const lineQueue = new Queue('line_queue', 'redis://redis:6380');
const lineQueue = require('./lineQueue');

const lineQueueWorker = lineQueue.process((job, done) => {
  setTimeout(() => {
    const { data } = job;
    console.log(data);
    done();
  }, 2000);
});

module.exports = lineQueueWorker;

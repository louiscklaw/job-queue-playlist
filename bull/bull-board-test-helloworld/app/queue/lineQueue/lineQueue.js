const express = require('express');
const Queue = require('bull');
const QueueMQ = require('bullmq');

const fs = require('fs');
const path = require('path');
const es = require('event-stream');

const { REDIS_URL } = require('../../config');

const lineQueue = new Queue('line_queue', REDIS_URL);

module.exports = lineQueue;

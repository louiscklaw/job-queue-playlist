const chai = require('chai');

var assert = require('assert');
const expect = require('chai').expect;
const fetch = require('node-fetch');

const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);

describe('node-fetch helloworld', function () {
  describe('#helloworld', function () {
    it('get something from example.com', function (done) {
      this.timeout(5 * 1000);
      (async () => {
        const response = await fetch('https://example.com/');
        const body = await response.text();
        assert.equal(body.length > 0, true);
        done();
      })();
    });
  });
});

describe('queue helloworld', function () {
  describe('#helloworld', function () {
    it('get something', function (done) {
      this.timeout(5 * 1000);
      (async () => {
        const response = await fetch('http://localhost:3000/helloworld');
        const res_json = await response.json();
        expect(res_json).to.deep.equalInAnyOrder({ hello: 'world' });
        done();
      })();
    });
  });
});

describe('queue createStackQueue', function () {
  describe('#createStackQueue', function () {
    it('create stack without define stack name, error response', function (done) {
      this.timeout(5 * 1000);
      (async () => {
        const response = await fetch('http://localhost:3000/createStackQueue');
        const res_json = await response.json();
        expect(res_json).to.deep.equalInAnyOrder({ status: 'error', message: 'name is required' });
        done();
      })();
    });

    it('create test stack with stack name', function (done) {
      this.timeout(5 * 1000);
      (async () => {
        const response = await fetch('http://localhost:3000/createStackQueue?name=helloworld_stack');
        const res_json = await response.json();
        expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
        done();
      })();
    });
  });
});

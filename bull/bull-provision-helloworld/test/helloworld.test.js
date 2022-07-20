const chai = require('chai');
const fetch = require('node-fetch');

const expect = require('chai').expect,
  assert = require('assert');

var Dockerode = require('dockerode');
var DockerodeCompose = require('dockerode-compose');

const deepEqualInAnyOrder = require('deep-equal-in-any-order');
chai.use(deepEqualInAnyOrder);

var docker = new Dockerode();
var compose_whoami = new DockerodeCompose(
  docker,
  'D:\\_workspace\\job-queue-playlist\\bull\\bull-provision-helloworld\\docker-templates\\whoami.yml',
  'helloworld_stack'
);

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

// describe('queue createStackQueue', function () {
//   describe('#createStackQueue', function () {
//     it('create stack without define stack name, error response', function (done) {
//       this.timeout(5 * 1000);
//       (async () => {
//         const response = await fetch('http://localhost:3000/createStackQueue');
//         const res_json = await response.json();
//         expect(res_json).to.deep.equalInAnyOrder({ status: 'error', message: 'name is required' });
//         done();
//       })();
//     });

//     it('create test stack with stack name', function (done) {
//       this.timeout(5 * 1000);
//       (async () => {
//         const response = await fetch('http://localhost:3000/createStackQueue?name=helloworld_stack');
//         const res_json = await response.json();
//         expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
//         done();
//       })();
//     });

//     it('suspend stack with stack name', function (done) {
//       this.timeout(5 * 1000);
//       (async () => {
//         const response = await fetch('http://localhost:3000/suspendStackQueue?name=helloworld_stack');
//         const res_json = await response.json();
//         expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
//         done();
//       })();
//     });

//     it('suspend stack with stack name, (stop a already stopped container)', function (done) {
//       this.timeout(5 * 1000);
//       (async () => {
//         const response = await fetch('http://localhost:3000/suspendStackQueue?name=helloworld_stack');
//         const res_json = await response.json();
//         expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
//         done();
//       })();
//     });
//   });
// });

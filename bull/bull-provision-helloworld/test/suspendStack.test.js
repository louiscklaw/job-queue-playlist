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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('#new_suspend stack helloworld', function () {
  beforeEach('bring up', function (done) {
    this.timeout(30000);
    (async () => {
      await compose_whoami.up();
      done();
    })();
  });

  it('suspend test stack with stack name', function (done) {
    this.timeout(30 * 1000);

    (async () => {
      const response = await fetch('http://localhost:3000/suspendStackQueue?name=helloworld_stack');
      const res_json = await response.json();
      expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
      console.log('helloworld');
      done();
    })();
  });

  afterEach('clean up', function (done) {
    this.timeout(30000);
    (async () => {
      await compose_whoami.down();
      done();
    })();
  });
});

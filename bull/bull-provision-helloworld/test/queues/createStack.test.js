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

describe('#new_create stack helloworld', function () {
  it('create test stack with stack name', function (done) {
    this.timeout(5 * 1000);
    (async () => {
      const response = await fetch('http://localhost:3000/createStackQueue?name=helloworld_stack');
      const res_json = await response.json();
      expect(res_json).to.deep.equalInAnyOrder({ status: 'accepted' });
      done();
    })();
  });

  afterEach('clean up', function (done) {
    this.timeout(30 * 1000);
    (async () => {
      // sleep a bit before run, wait for container steady
      await sleep(10 * 1000);

      var wait_container_appears = true;
      while (wait_container_appears) {
        var listContainers = await docker.listContainers({ all: true, filters: { label: [`com.docker.compose.project=helloworld_stack`] } });
        if (listContainers.length > 0) {
          if (listContainers[0].State == 'running') {
            wait_container_appears = false;
          } else {
            await sleep(1000);
            console.log('wait to check docker status');
          }
        }
      }

      await compose_whoami.down({ volumes: true });
      done();
    })();
  });
});

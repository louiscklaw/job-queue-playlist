const chalk = require('chalk');
var Dockerode = require('dockerode');
var DockerodeCompose = require('dockerode-compose');
const fs = require('fs');

const log = console.log;
const logInfo = (message) => log(chalk.green(`INFO: ${message}`));
const logWarning = (message) => log(chalk.yellow(`WARNING: ${message}`));
const logError = (message) => log(chalk.red(`ERROR: ${message}`));

const PROJ_HOME = 'D:\\_workspace\\job-queue-playlist\\bull\\bull-provision-helloworld';
const DOCKER_TEMPLATE_HOME = `${PROJ_HOME}\\docker-templates`;
const DOCKER_COMPOSE_TEMPLATE = `${DOCKER_TEMPLATE_HOME}\\whoami.yml`;
const DOCKER_COMPOSE_MODIFIED = `c:\\temp\\modified.yml`;

function updateProgress(job, step, total_steps) {
  return job.progress(Math.floor((step / total_steps) * 100));
}

async function modifyDockerComposeTemplate(source_file_path, target_file_path) {
  var temp = await fs.readFileSync(source_file_path);
  await fs.writeFileSync(target_file_path, temp);
  return;
}

module.exports = (app, queue) => {
  queue.process((job, done) => {
    (async () => {
      if (!job.data.params) {
        logError('params is required');
        done(new Error('params is required and not null'));
      }

      var { oper } = job.data.params;

      switch (oper) {
        case 'create':
          logInfo('create stack initiated');

          // docker-compose up
          var total_steps = 3;
          var step = 1;

          try {
            if (!job.data.params.stack_name) {
              logError('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }
            var { stack_name } = job.data.params;

            await modifyDockerComposeTemplate(DOCKER_COMPOSE_TEMPLATE, DOCKER_COMPOSE_MODIFIED);
            console.log(`${step} modify docker-compose template done`);
            updateProgress(job, step++, total_steps);

            var docker = new Dockerode();
            var compose_whoami = new DockerodeCompose(docker, DOCKER_COMPOSE_MODIFIED, stack_name);

            await compose_whoami.pull(null);
            console.log(`${step} pull images done`);
            updateProgress(job, step++, total_steps);

            await compose_whoami.up();
            console.log(`${step} stack up done`);
            updateProgress(job, step++, total_steps);
            done(null, 'create stack done');
          } catch (error) {
            console.error(`error during create stack, ${error.message}`);
            done(new Error(`error during create stack, ${error.message}`));
          }

          break;

        case 'suspend':
          // suspend container by project name
          (async () => {
            console.log(`suspend stack initiated`);
            if (!job.data.params.stack_name) {
              console.log('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }
            var { stack_name } = job.data.params;

            var docker = new Dockerode();
            // console.log(`com.docker.compose.project=${stack_name}`);
            var listContainers = await docker.listContainers({ all: true, filters: { label: [`com.docker.compose.project=${stack_name}`] } });

            if (listContainers.length > 0) {
              for (var i = 0; i < listContainers.length; i++) {
                var containerInfo = listContainers[i];
                logInfo(`suspending ${containerInfo.Id.slice(0, 8)}`);
                var container_state = await docker.getContainer(containerInfo.Id).inspect();
                if (container_state.State.Status == 'running') {
                  console.log('container running, stop container');
                  await docker.getContainer(containerInfo.Id).stop();
                } else {
                  logWarning('container is not running, nothing to do');
                }
              }
            } else {
              logWarning('no container found to suspend');
            }

            console.log('suspend done');
            done();
          })();
          break;

        case 'remove':
          console.log(`remove stack initiated`);
          // docker-compose down
          var total_steps = 1;
          var step = 1;

          try {
            if (!job.data.params.stack_name) {
              logError('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }
            var { stack_name } = job.data.params;

            console.log('start remove stack');
            var docker = new Dockerode();
            var compose_whoami = new DockerodeCompose(docker, DOCKER_COMPOSE_MODIFIED, stack_name);

            await compose_whoami.down({ volumes: true });
            updateProgress(job, step++, total_steps);

            console.log('remove stack done');
            done(null, 'remove stack done');
          } catch (error) {
            logError({ error: error.message });
            done(new Error({ message: 'error during remove stack', error }));
          }
          break;

        default:
          logError({ error: `cannot find oper ${oper}` });
          done(new Error('oper not found'));
          break;
      }
    })();
  });

  app.get('/dockerOperationQueue', (req, res) => {
    queue.add({ queue: 'dockerOperationQueue', params: req.query }, { attempts: 1 });
    res.send({ status: 'ok' });
  });
};

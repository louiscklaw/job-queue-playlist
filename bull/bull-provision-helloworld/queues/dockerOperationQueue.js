const chalk = require('chalk');
const fetch = require('node-fetch');
var Dockerode = require('dockerode');
var DockerodeCompose = require('dockerode-compose');
const fs = require('fs');

const log = console.log;
const logInfo = (message) => log(chalk.green(`INFO: ${message}`));
const logWarning = (message) => log(chalk.yellow(`WARNING: ${message}`));
const logError = (message) => log(chalk.red(`ERROR: ${message}`));
const logDebug = (message) => log(message);

const PROJ_HOME = 'D:\\_workspace\\job-queue-playlist\\bull\\bull-provision-helloworld';
const DOCKER_TEMPLATE_HOME = `${PROJ_HOME}\\docker-templates`;
const DOCKER_COMPOSE_TEMPLATE = `${DOCKER_TEMPLATE_HOME}\\whoami.yml`;
const DOCKER_COMPOSE_MODIFIED = `c:\\temp\\modified.yml`;

function updateProgress(job, step, total_steps) {
  return job.progress(Math.floor((step / total_steps) * 100));
}

async function modifyDockerComposeTemplate(source_file_path, target_file_path, options_to_replace) {
  var temp = await fs.readFileSync(source_file_path, { encoding: 'utf-8' });
  Object.keys(options_to_replace).forEach((keys) => {
    // ${helloworld} ==> \$\{helloworld\}
    var replace = '\\$\\{' + keys + '\\}';
    var re = new RegExp(replace, 'g');
    temp = temp.replace(re, options_to_replace[keys]);
  });
  await fs.writeFileSync(target_file_path, temp, { encoding: 'utf-8' });
  return;
}

function checkEmptyStackName(job, done) {
  if (!job.data.params.stack_name) {
    logError('error stack_name not found');
    done(new Error('stack_name is required and not null'));
  }

  return;
}

async function fetchBlackList(done) {
  if (process.env.NODE_ENV === 'production') {
    logError('production black list json fetch not handled');
    return ['whoami'];
  }
  return await fetch('http://localhost:3001/blacklist')
    .then((res) => res.json())
    .catch((err) => {
      logError('error fetching black list');
      done(new Error('cannot fetch subdomain name black list'));
    });
}

async function checkDuplicateStackName(job, done) {
  var black_list = await fetchBlackList(done);

  var { stack_name } = job.data.params;
  if (black_list.indexOf(stack_name) > -1) {
    logError('error black listed stack_name found');
    done(new Error('stack_name is in black list'));
  }
  return;
}

function checkValidJobData(job, done) {
  (async () => {
    await checkEmptyStackName(job, done);
    await checkDuplicateStackName(job, done);
  })();

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
            checkValidJobData(job, done);

            var { stack_name } = job.data.params;

            if (stack_name) {
              logError('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }

            await modifyDockerComposeTemplate(DOCKER_COMPOSE_TEMPLATE, DOCKER_COMPOSE_MODIFIED, {
              PROJECT_NAME: stack_name,
              SUBDOMAIN_NAME: stack_name.toLowerCase(),
              ROUTERS_NAME: stack_name.toLowerCase(),
              MIDDLEWARES_NAME: stack_name.toLowerCase(),
              SERVICES_NAME: stack_name.toLowerCase(),
              LOWER_CASE_PROJECT_NAME: stack_name.toLowerCase(),
            });
            logDebug(`${step} modify docker-compose template done`);
            updateProgress(job, step++, total_steps);

            var docker = new Dockerode();
            var compose_whoami = new DockerodeCompose(docker, DOCKER_COMPOSE_MODIFIED, stack_name);

            await compose_whoami.pull(null);
            logDebug(`${step} pull images done`);
            updateProgress(job, step++, total_steps);

            await compose_whoami.up();
            logDebug(`${step} stack up done`);
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
            logDebug(`suspend stack initiated`);
            if (!job.data.params.stack_name) {
              logDebug('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }
            var { stack_name } = job.data.params;

            var docker = new Dockerode();
            // logDebug(`com.docker.compose.project=${stack_name}`);
            var listContainers = await docker.listContainers({ all: true, filters: { label: [`com.docker.compose.project=${stack_name}`] } });

            if (listContainers.length > 0) {
              logInfo(`number of container to stop ${listContainers.length}`);
              for (var i = 0; i < listContainers.length; i++) {
                var containerInfo = listContainers[i];
                var container_state = await docker.getContainer(containerInfo.Id).inspect();
                logInfo(`suspending ${containerInfo.Id.slice(0, 8)}, ${container_state.State.Status}`);

                if (container_state.State.Status == 'running') {
                  logInfo('container running, stop container');
                  await docker
                    .getContainer(containerInfo.Id)
                    .stop()
                    .catch((err) => logWarning('container already stopped ?'));
                } else {
                  logWarning('container is not running, nothing to do');
                }
              }
            } else {
              logWarning('no container found to suspend');
            }

            logDebug('suspend done');
            done();
          })();
          break;

        case 'remove':
          logDebug(`remove stack initiated`);
          // docker-compose down
          var total_steps = 1;
          var step = 1;

          try {
            if (!job.data.params.stack_name) {
              logError('error stack_name not found');
              done(new Error('stack_name is required and not null'));
            }
            var { stack_name } = job.data.params;

            logDebug('start remove stack');
            var docker = new Dockerode();
            var compose_whoami = new DockerodeCompose(docker, DOCKER_COMPOSE_MODIFIED, stack_name);

            await compose_whoami.down({ volumes: true });
            updateProgress(job, step++, total_steps);

            logDebug('remove stack done');
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

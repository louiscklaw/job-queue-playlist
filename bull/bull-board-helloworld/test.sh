#!/usr/bin/env bash

set -ex

docker-compose kill
docker-compose up --build
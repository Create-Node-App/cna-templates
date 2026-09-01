#!/usr/bin/env bash

# Check if docker and docker-compose are installed
if ! [ -x "$(command -v docker)" ]; then
    echo 'Error: docker is not installed.' >&2
    exit 1
fi

if ! [ -x "$(command -v docker-compose)" ]; then
    echo 'Error: docker-compose is not installed.' >&2
    exit 1
fi

ROOT="$(realpath "$(dirname "$0")"/..)"
DOCKER_DIR="$(realpath "${ROOT}/docker")"

# Craft the docker-compose command
DOCKER_COMPOSE_CMD="docker-compose -f ${ROOT}/compose.yml"

# Collect compose files from the docker directory
COMPOSE_FILES_FLAGS="$(find "${DOCKER_DIR}" -type f -name "compose.y*ml" -exec echo -n " -f {}" \;)"
DOCKER_COMPOSE_CMD="${DOCKER_COMPOSE_CMD}${COMPOSE_FILES_FLAGS}"

# Run docker-compose with the collected files
DOCKER_COMPOSE_CMD="${DOCKER_COMPOSE_CMD} $*"

# Print the docker-compose command
echo "Running docker-compose command: ${DOCKER_COMPOSE_CMD}"

# Run the docker-compose command
eval "${DOCKER_COMPOSE_CMD}"

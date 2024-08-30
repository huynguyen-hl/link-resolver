# Link resolver

## Prerequisites

- [Node.js](https://nodejs.org/en/) version 22.0.0

## Installation

```bash
$ npm install
```

## Environment variables

Create a `.env.development.local` file in the root directory of the project with the following content in `.env.development.local.example` file:

```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=idr-bucket
IDENTIFIER_PATH=identifiers
RESOLVER_DOMAIN=http://localhost:3000
LINK_TYPE_VOC_DOMAIN=http://localhost:3000/voc
API_KEY=test123
APP_NAME=IDR
NODE_ENV=development
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Specification

For detailed information about our API endpoints, request/response formats, and authentication methods, please refer to our API documentation:
[http://localhost:3000/api](http://localhost:3000/api)

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### For e2e test:

Pre-requisites to run on local:

- Change the environment in the docker-compose.yaml for test environment (Following the .env.test.local.example file)
- Run the command `docker-compose up --build` to start the application in test mode

```bash
# e2e tests
$ npm run test:e2e
```

## MinIO Configuration

### Overview

The IDR service uses MinIO for object storage. The Docker Compose configuration allows for flexible and persistent data storage across different operating systems.

### Configuration Details

In the `docker-compose.yml` file, MinIO's data storage is configured as follows:

```yaml
volumes:
  - ${MINIO_DATA_DIR:-./minio_data}:/data
```

This configuration uses an environment variable `MINIO_DATA_DIR` if set, otherwise defaulting to `./minio_data` in the current directory.

### Reasoning

1. **Cross-platform compatibility**: This setup works on both Unix-based systems (Linux, macOS) and Windows.
2. **Flexibility**: Users can easily change the data directory without modifying the `docker-compose.yml` file.
3. **Default behaviour**: If not configured, it uses a local directory, ensuring the setup works out of the box.
4. **Data persistence**: Allows for data to persist even if the container is removed or the repository is cloned again.

### Usage

To persist MinIO storage even if you remove the container or clone the repository again, set the `MINIO_DATA_DIR` environment variable. This is recommended over the default configuration, as deleting the cloned repository will result in data loss if using the default.

#### Unix-based systems (Linux, macOS):

```bash
export MINIO_DATA_DIR=~/minio/idr/data
docker-compose up
```

#### Windows (PowerShell):

```powershell
$env:MINIO_DATA_DIR = "$HOME\minio\idr\data"
docker-compose up
```

#### Windows (Command Prompt):

```cmd
set MINIO_DATA_DIR=%USERPROFILE%\minio\idr\data
docker-compose up
```

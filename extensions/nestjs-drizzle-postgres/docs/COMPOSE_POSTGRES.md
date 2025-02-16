# Postgres + PGAdmin4

As part of our `docker-compose` setup, we provide a Postgres server and a PGAdmin4 server. The Postgres server is used to store the data for the application, and the PGAdmin4 server is used to manage the Postgres server.

The configuration files can be found in the `docker/postgres` directory and will run the following services:

- `postgresql`: Postgres server
- `pgadmin4`: PGAdmin4 server running at [http://localhost:5050](http://localhost:5050)

## Initialization

If you would like to do additional initialization in an image derived from this one, add one or more `*.sql`, `*.sql.gz`, or `*.sh` scripts under `docker/postgres/initdb.d/`. After the entrypoint calls initdb to create the default postgres user and database, it will run any `*.sql` files, run any executable `*.sh` scripts, and source any non-executable `*.sh` scripts found in that directory to do further initialization before starting the service.

> Warning: scripts in `docker/postgres/initdb.d/` are only run if you start the container with a data directory that is empty; any pre-existing database will be left untouched on container startup. One common problem is that if one of your `docker/postgres/initdb.d/` scripts fails (which will cause the entrypoint script to exit) and your orchestrator restarts the container with the already initialized data directory, it will not continue on with your scripts.

For example, to add an additional user and database, add the following to `docker/postgres/initdb.d/init-user-db.sh`:

```sh
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER docker;
    CREATE DATABASE docker;
    GRANT ALL PRIVILEGES ON DATABASE docker TO docker;
EOSQL
```

These initialization files will be executed in sorted name order as defined by the current locale, which defaults to en_US.utf8. Any `*.sql` files will be executed by `POSTGRES_USER`, which defaults to the postgres superuser. It is recommended that any psql commands that are run inside of a `*.sh` script be executed as `POSTGRES_USER` by using the `--username "$POSTGRES_USER"` flag. This user will be able to connect without a password due to the presence of trust authentication for Unix socket connections made inside the container.

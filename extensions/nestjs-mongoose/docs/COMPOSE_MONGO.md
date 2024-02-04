# MongoDB + Mongo Express

As part of our `docker-compose` setup, we provide a MongoDB service and a Mongo Express service.

The configuration files can be found in the `docker/mongo` directory and will run the following services:

- `mongo`: MongoDB server
- `mongo-express`: Mongo Express server running at [http://localhost:8081](http://localhost:8081)

## MongoDB Initialization

When the MongoDB container is started for the first time it will execute files with extensions `.sh` and `.js` that are found in `docker/mongo/initdb.d/`. Files will be executed in alphabetical order. `.js` files will be executed by mongo using the database specified by the `MONGO_INITDB_DATABASE` variable, if it is present, or test otherwise. You may also switch databases within the `.js` script.

import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => {
  // Use the MONGO_URI if it exists, otherwise build the URI from the other environment variables.
  // This is helpful when using a service like MongoDB Atlas.
  const mongoUri = configService.get<string>("MONGO_URI", "");

  if (mongoUri) {
    return {
      uri: mongoUri,
    };
  }

  const protocol = configService.get<string>("MONGO_PROTOCOL", "mongodb");
  const username = configService.get<string>("MONGO_USERNAME");
  const password = configService.get<string>("MONGO_PASSWORD");
  const host = configService.get<string>("MONGO_HOST", "localhost");
  const port = configService.get<string>("MONGO_PORT", "27017");
  const database = configService.get<string>("MONGO_DATABASE", "");

  return {
    uri: `${protocol}://${username}:${password}@${host}:${port}/${database}`,
  };
};

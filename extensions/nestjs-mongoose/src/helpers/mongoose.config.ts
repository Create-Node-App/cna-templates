import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => {
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

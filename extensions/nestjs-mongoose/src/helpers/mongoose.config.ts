import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => ({
  uri: `mongodb://${configService.get<string>('MONGO_USERNAME')}:${configService.get<string>(
    'MONGO_PASSWORD',
  )}@localhost:27017/${configService.get<string>('MONGO_DATABASE')}`,
});

import { Module } from '@nestjs/common';
import { WeatherService } from './weathe-api.service';
import { WeatherController } from './weathe-api.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';

@Module({
  imports: [ConnectDbModule],
  controllers: [WeatherController],
  providers: [WeatherService]
})
export class WeatheApiModule { }
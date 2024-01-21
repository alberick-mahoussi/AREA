import { Module } from '@nestjs/common';
import { TimeService } from './time.service';
import { TimeController } from './time.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';

@Module({
  imports: [ConnectDbModule],
  providers: [TimeService],
  controllers: [TimeController],
})
export class TimeCheckModule {}

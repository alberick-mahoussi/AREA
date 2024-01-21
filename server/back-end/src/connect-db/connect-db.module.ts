import { Global, Module } from '@nestjs/common';
import { ConnectDbService } from './connect-db.service';

@Global()
@Module({
  providers: [ConnectDbService],
  exports: [ConnectDbService],
})
export class ConnectDbModule {}

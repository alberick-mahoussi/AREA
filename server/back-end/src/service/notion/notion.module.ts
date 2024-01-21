import { Module } from '@nestjs/common';
import { NotionController } from './notion.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { NotionService } from './notion.service';

@Module({
  imports: [ConnectDbModule],
  controllers: [NotionController],
  providers: [NotionService],
  exports: [NotionService],  
})
export class NotionModule {}
import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { MailService } from '../mail/mail.service';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';

@Module({
  imports: [ConnectDbModule],
  controllers: [DiscordController],
  providers: [DiscordService, MailService],
  exports: [DiscordService],
})
export class DiscordModule {}

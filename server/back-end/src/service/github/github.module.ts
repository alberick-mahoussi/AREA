import { Module, forwardRef } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { MailService } from '../mail/mail.service';
import { NotionService } from '../notion/notion.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { DiscordService } from '../discord/discord.service';
import { GitlabModule } from '../gitlab/gitlab.module';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MicrosoftService } from '../microsoft/microsoft.service';
import { NotionModule } from '../notion/notion.module';
import { DiscordModule } from '../discord/discord.module';
import { MicrosoftModule } from '../microsoft/microsoft.module';
import { SpotifyService } from '../spotify/spotify.service';
import { GoogleService } from '../google/google.service';

@Module({
  imports: [ConnectDbModule, forwardRef(() => GitlabModule), forwardRef(() => MicrosoftModule)],
  controllers: [GithubController],
  providers: [GithubService, GitlabService, ConfigService, ConnectDbService, MailService, NotionService, DiscordService, MicrosoftService, SpotifyService, GoogleService],
  exports: [GithubService]
})
export class GithubModule {}

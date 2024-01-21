import { Module, forwardRef } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { GitlabController } from './gitlab.controller';
import { MailService } from '../mail/mail.service';
import { NotionService } from '../notion/notion.service';
import { GithubService } from '../github/github.service';
import { DiscordService } from '../discord/discord.service';
import { GithubModule } from '../github/github.module';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MicrosoftService } from '../microsoft/microsoft.service';
import { NotionModule } from '../notion/notion.module';
import { DiscordModule } from '../discord/discord.module';
import { MicrosoftModule } from '../microsoft/microsoft.module';
import { SpotifyService } from '../spotify/spotify.service';
import { GoogleService } from '../google/google.service';

@Module({
  imports: [ConnectDbModule, forwardRef(() => GithubModule), forwardRef(() => MicrosoftModule)],
  controllers: [GitlabController],
  providers: [GitlabService, GithubService, ConfigService, ConnectDbService, MailService, MicrosoftService, NotionService, DiscordService, SpotifyService, GoogleService],
  exports: [GitlabService]
})
export class GitlabModule {}

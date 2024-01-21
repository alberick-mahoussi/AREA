// microsoft.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MicrosoftService } from './microsoft.service';
import { MicrosoftController } from './microsoft.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Utils } from '../utils';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { GitlabService } from '../gitlab/gitlab.service';
import { GithubService } from '../github/github.service';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { NotionService } from '../notion/notion.service';
import { DiscordService } from '../discord/discord.service';
import { GitlabModule } from '../gitlab/gitlab.module';
import { GithubModule } from '../github/github.module';
import { NotionModule } from '../notion/notion.module';
import { DiscordModule } from '../discord/discord.module';
import { AuthModule } from 'src/auth/auth.module';
import { SpotifyService } from '../spotify/spotify.service';
import { SpotifyModule } from '../spotify/spotify.module';
import { GoogleService } from '../google/google.service';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [ConnectDbModule, JwtModule.register({}), forwardRef(() => GitlabModule), NotionModule, DiscordModule, AuthModule, SpotifyModule, GoogleModule],
  controllers: [MicrosoftController],
  providers: [MicrosoftService, GitlabService, GithubService, ConfigService, ConnectDbService, AuthService, Utils, NotionService, DiscordService, MailService, SpotifyService, GoogleService],
  exports: [MicrosoftService]
})
export class MicrosoftModule {}

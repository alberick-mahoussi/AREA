import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { GithubService } from 'src/service/github/github.service';
import { MailService } from 'src/service/mail/mail.service';
import { GoogleService } from 'src/service/google/google.service';
import { MicrosoftService } from 'src/service/microsoft/microsoft.service';
import { GitlabService } from 'src/service/gitlab/gitlab.service';
import { NotionService } from 'src/service/notion/notion.service';
import { DiscordService } from 'src/service/discord/discord.service';
import { SpotifyService } from 'src/service/spotify/spotify.service';

@Module({
  imports: [ConnectDbModule],
  controllers: [UserController,],
  providers: [UserService, GithubService, MailService, GoogleService, MicrosoftService, GitlabService, NotionService, DiscordService, SpotifyService]
})
export class UserModule {}

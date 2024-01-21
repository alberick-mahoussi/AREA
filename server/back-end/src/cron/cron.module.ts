import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { WeatheApiModule } from 'src/service/weathe-api/weathe-api.module';
import { WeatherService } from 'src/service/weathe-api/weathe-api.service';
import { MailModule } from 'src/service/mail/mail.module';
import { MailService } from 'src/service/mail/mail.service';
import { TimeService } from 'src/service/time/time.service';
import { NotionModule } from 'src/service/notion/notion.module';
import { NotionService } from 'src/service/notion/notion.service';
import { GithubService } from 'src/service/github/github.service';
import { GithubModule } from 'src/service/github/github.module';
import { DiscordService } from 'src/service/discord/discord.service';
import { DiscordModule } from 'src/service/discord/discord.module';
import { GitlabModule } from 'src/service/gitlab/gitlab.module';
import { GitlabService } from 'src/service/gitlab/gitlab.service';
import { GoogleService } from 'src/service/google/google.service';
import { MicrosoftService } from 'src/service/microsoft/microsoft.service';
import { MicrosoftModule } from 'src/service/microsoft/microsoft.module';
import { SpotifyService } from 'src/service/spotify/spotify.service';
import { SpotifyModule } from 'src/service/spotify/spotify.module';
import { GoogleModule } from 'src/service/google/google.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConnectDbModule, WeatheApiModule, MailModule, NotionModule, GithubModule, DiscordModule, GitlabModule, MicrosoftModule, SpotifyModule, GoogleModule],
  providers: [CronService, MailService, WeatherService, TimeService, NotionService, GithubService, DiscordService, GitlabService, MicrosoftService, SpotifyService, GoogleService],
  controllers: [],
})
export class CronServiceModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConnectDbModule } from './connect-db/connect-db.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy';
import { GoogleModule } from './service/google/google.module';
import { MicrosoftModule } from './service/microsoft/microsoft.module';
import { GithubModule } from './service/github/github.module';
import { WeatheApiModule } from './service/weathe-api/weathe-api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeCheckModule } from './service/time/time.module';
import { DiscordModule } from './service/discord/discord.module';
import { SpotifyModule } from './service/spotify/spotify.module';
import { GitlabModule } from './service/gitlab/gitlab.module';
import { NotionModule } from './service/notion/notion.module';
import { UserModule } from './user/user.module';
import { AboutController } from './about/about.controller';
import { XModule } from './service/x/x.module';
import { CronServiceModule } from './cron/cron.module';
import { Utils } from './service/utils';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    ConnectDbModule,
    GoogleModule,
    MicrosoftModule,
    GithubModule,
    TimeCheckModule,
    WeatheApiModule,
    DiscordModule,
    SpotifyModule,
    GitlabModule,
    NotionModule,
    UserModule,
    XModule,
    CronServiceModule
  ],
  controllers: [AppController, AboutController],
  providers: [AppService, JwtStrategy, Utils],
})
export class AppModule {}

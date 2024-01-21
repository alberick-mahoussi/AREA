import { ConnectDbService } from '../connect-db/connect-db.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TimeService } from '../service/time/time.service';
import { WeatherService } from "../service/weathe-api/weathe-api.service";
import { Status, User, Token } from '@prisma/client';
import { MailService } from 'src/service/mail/mail.service';
import { GithubService } from '../service/github/github.service';
import { NotionService } from 'src/service/notion/notion.service';
import { DiscordService } from 'src/service/discord/discord.service';
import { GitlabService } from 'src/service/gitlab/gitlab.service';
import { GoogleService } from 'src/service/google/google.service';
import { MicrosoftService } from 'src/service/microsoft/microsoft.service';
import { SpotifyService } from 'src/service/spotify/spotify.service';

@Injectable()
export class CronService {
  constructor(
    private mailService: MailService,
    private notionService: NotionService,
    private weather: WeatherService,
    private timeCheck: TimeService,
    private discordService: DiscordService,
    private githubService: GithubService,
    private gitlabService: GitlabService,
    private readonly config: ConfigService,
    private db: ConnectDbService,
    private outlook: MicrosoftService,
    private spotifyService: SpotifyService,
    private gmail: GoogleService,
    ) { }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async StartReactions(): Promise<void> {
    const activeAreas = await this.db.area.findMany({
      where: {
        state: Status.ON,
      },
    });
    let contents: string;
    for (const area of activeAreas) {
      if (area.Action_Service === "WorldTime") {
        if (area.Action_id === 0) {
          contents = await this.timeCheck.checkTimeAction(area);
        }
      }
      if (area.Action_Service === "Weather") {
        if (area.Action_id === 0) {
          contents = await this.weather.GetTemp(area);
        }
        if (area.Action_id === 1) {
          contents = await this.weather.GetWeather(area);
        }
      }
      if (area.Action_Service === "Spotify") {
        contents = await this.spotifyService.ActionSpotify(area)
      }
      //REACTIONS
      if (contents) {
        if (area.Reaction_Service === "Discord") {
          await this.discordService.ReactionDiscord(contents, area);
        }
        if (area.Reaction_Service === "Gitlab") {
          await this.gitlabService.ReactionGitlab(area);
        }
        if (area.Reaction_Service === "Github") {
          await this.githubService.ReactionGitHub(area);
        }
        if (area.Reaction_Service === "Outlook") {
          await this.outlook.ReactionOutlook(area);
        }
        if (area.Reaction_Service === "Mail") {
          await this.mailService.sendEmail(contents, area);
        }
        if (area.Reaction_Service === "Notion") {
          await this.notionService.ReactionNotion(contents, area);
        }
        if (area.Reaction_Service === "Gmail") {
          await this.gmail.ReactionGmail(area)
        }
        if (area.Reaction_Service === "Outlook") {
          await this.outlook.ReactionOutlook(area)
        }
        if (area.Reaction_Service === "Google Calendar") {
          await this.gmail.ReactionEventCalendar(area)
        }
        if (area.Reaction_Service === "Spotify") {
          await this.spotifyService.ReactionSpotify(contents, area);
        }
      }
    }
  }
}
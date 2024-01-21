import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AreaDto } from 'src/auth/dto';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateAreaState } from 'src/model/Area';
import { Token, Area, Service } from '@prisma/client';
import { GithubService } from 'src/service/github/github.service';
import { GoogleService } from 'src/service/google/google.service';
import { MicrosoftService } from '../service/microsoft/microsoft.service';
import { GitlabService } from 'src/service/gitlab/gitlab.service';
import { DiscordService } from 'src/service/discord/discord.service';

@Injectable()
export class UserService {
  constructor(
    private db: ConnectDbService,
    private GithubService: GithubService,
    private GoogleService: GoogleService,
    private microsoftService: MicrosoftService,
    private gitService: GitlabService,
    private DiscordService: DiscordService
  ) {}

  async getUsersAreas(id: number) {
    try {
      const areas = await this.db.area.findMany({
        where: { UserId: id },
      });
      if (areas && areas.length > 0) {
        return { areas };
      } else {
        return {};
      }
    } catch (err) {
      console.error(err);
    }
  }
  async InsertArea(id: number, dto: AreaDto) {
    try {
      const services = await this.db.service.findMany({
        where: { UserId: id },
      });

      if (
        services.some(
          (service) =>
            service.NameService === dto.ActionName &&
            service.RequiresAuth === true &&
            service.TokenId === undefined,
        ) ||
        services.some(
          (service) =>
            service.NameService === dto.ReactionName &&
            service.RequiresAuth === true &&
            service.TokenId === undefined,
        )
      ) {
        console.log('error no possible');
        throw new ForbiddenException(
          "Sorry This User don't have a service required",
        );
      }
      const actionService: Service = services.find(
        (service) => service.NameService === dto.ActionName,
      );
      let token = undefined;
      if (actionService.RequiresAuth === true && actionService.TokenId !== null) {
        token = await this.db.token.findUnique({
          where: { id: actionService.TokenId },
        });
        console.log(token.Token);
      }
      const NewArea = this.db.area.create({
        data: {
          User: {
            connect: { id: id },
          },
          Action_id: parseInt(dto.ActionId, 10),
          Action_Service: dto.ActionName,
          ActionParam: dto.ActionParam,
          ReactionId: parseInt(dto.ReactionId, 10),
          Reaction_Service: dto.ReactionName,
          ReactionParam: dto.ReactionParam,
          state: 'ON',
        },
      });

      const updatedUser = await this.db.user.update({
        where: { id: id },
        data: {
          areas: {
            connect: { Id: (await NewArea).Id },
          },
        },
      });
      if (actionService.RequiresAuth == true && actionService.AvailableWebhook)
        this.LaunchArea(dto.ActionName, dto.ActionParam, token.Token);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Sorry this AREa exist');
        }
      } else {
        console.error('Unhandled error:', error);
        throw new ForbiddenException('An unexpected error occurred');
      }
    }
  }

  async getUsersServices(id: number) {
    try {
      const services = await this.db.service.findMany({
        where: { UserId: id },
      });
      if (services && services.length > 0) {
        return { services };
      } else {
        return {};
      }
    } catch (err) {
      console.error(err);
    }
  }

  async LaunchArea(
    ActionService: string,
    actionsParams: string[],
    accessToken: string,
  ) {
    try {
      switch (ActionService) {
        case 'Github':
          if (actionsParams.length == 1) {
            this.GithubService.GithubAddWebhook(
              await GithubService.getOwner(accessToken),
              actionsParams[0],
              accessToken,
            );
          } else if (actionsParams.length == 2) {
            this.GithubService.GithubAddWebhook(
              await GithubService.getOwner(accessToken),
              actionsParams[1],
              accessToken,
            );
          }
          break;
        case 'Discord':
          this.DiscordService.DiscordAddWebhook(actionsParams[0], actionsParams[1]);
          break;
        case 'Gmail':
          console.log('Gmail')
          this.GoogleService.GmailAddWebhook(accessToken);
          break;
        case 'Outlook': {
          if (actionsParams.length == 1)
            this.microsoftService.SubscriptionNewMail(accessToken, actionsParams[0])
          }
          break;
        case 'Gitlab':
            this.gitService.addGitlabWebhook(actionsParams[0], accessToken)
          break;
        case 'Google Calendar':
          this.GoogleService.GoogleCalendarWebhook(accessToken)
      }
    } catch (err) {}
  }

  async UpdateStateArea(idUser: number, idArea: number) {
    const user = await this.db.area.update({
      where: { Id: idArea, UserId: idUser },
      data: {
        state: 'OFF',
      },
    });
  }

}

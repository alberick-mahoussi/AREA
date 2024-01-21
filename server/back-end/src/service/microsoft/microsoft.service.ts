import { Injectable, Inject, forwardRef, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Area, Token } from '@prisma/client';
import axios from 'axios';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MicrosoftEmail } from 'src/model/Microsoft';
import { GithubService } from '../github/github.service';
import { MailService } from '../mail/mail.service';
import { NotionService } from '../notion/notion.service';
import { DiscordService } from '../discord/discord.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { SpotifyService } from '../spotify/spotify.service';
import { GoogleService } from '../google/google.service';

@Injectable()
export class MicrosoftService {
  constructor(
    @Inject(forwardRef(() => GitlabService))
    private gitlab: GitlabService,
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService,
    // @Inject(forwardRef(() => NotionService))
    private notion: NotionService,
    // @Inject(forwardRef(() => DiscordService))
    private discord: DiscordService,
    private config: ConfigService,
    @Inject(forwardRef(() => ConnectDbService))
    private db: ConnectDbService,
    private mail: MailService,
    private spotify: SpotifyService,
    private google: GoogleService
  ) {}

  async exchangeCodeForToken(mycode: string): Promise<string> {
    try {
      const tenantId = this.config.get('MICROSOFT_TENANT_ID');
      const endpoint = `https://login.microsoftonline.com/901cb4ca-b862-4029-9306-e5cd0f6d9f86/oauth2/v2.0/token`;
      const data = {
        client_id: this.config.get('MICROSOFT_CLIENT_ID'),
        client_secret: this.config.get('MICROSOFT_SECRET_VALUE'),
        scope:
          'user.read calendars.readWrite contacts.readWrite mail.readWrite',
        code: mycode,
        redirect_uri: 'http://localhost:8081/microsoft',
        grant_type: 'authorization_code',
      };

      const tokenResponse = await axios.post(
        endpoint,
        new URLSearchParams(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const token = tokenResponse.data.access_token;
      return token;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message,
        error.response?.data?.error_description,
      );
      throw new Error("Erreur lors de l'échange du code contre le token");
    }
  }

  async exchangeCodeForTokenRegister(mycode: string): Promise<string> {
    try {
      const tenantId = this.config.get('MICROSOFT_TENANT_ID');
      const endpoint = `https://login.microsoftonline.com/901cb4ca-b862-4029-9306-e5cd0f6d9f86/oauth2/v2.0/token`;
      const data = {
        client_id: this.config.get('MICROSOFT_CLIENT_ID'),
        client_secret: this.config.get('MICROSOFT_SECRET_VALUE'),
        scope:
          'user.read calendars.readWrite contacts.readWrite mail.readWrite',
        code: mycode,
        redirect_uri: 'http://localhost:8081/outlook',
        grant_type: 'authorization_code',
      };

      const tokenResponse = await axios.post(
        endpoint,
        new URLSearchParams(data),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      const token = tokenResponse.data.access_token;
      return token;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message,
        error.response?.data?.error_description,
      );
      throw new Error("Erreur lors de l'échange du code contre le token");
    }
  }

  async reactionController(area: Area, Body: any) {
    const reaction: string = area.Reaction_Service;

    switch (reaction) {
      case 'Mail':
        this.mail.sendEmail(
          "Mail recu",
          area,
        );
        break;
      case 'Discord':
        this.discord.ReactionDiscord("Mail recu", area);
        break;
      case 'Notion':
        this.notion.ReactionNotion("Mail recu", area)
        break;
      case 'Github':
        this.githubService.ReactionGitHub(area);
        break;
      case 'Gitlab':
        this.gitlab.ReactionGitlab(area);
        break;
      case 'Gmail':
        this.google.ReactionGmail(area)
        break;
      case 'Google Calendar':
        this.google.ReactionEventCalendar(area)
        break;
      case 'Microsoft':
        this.ReactionOutlook(area);
        break;
      case 'Spotify':
        this.spotify.ReactionSpotify("Mail recu", area)
        break;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return userInfoResponse.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de l'utilisateur :",
        error,
      );
      throw new Error(
        "Erreur lors de la récupération des informations de l'utilisateur",
      );
    }
  }

  async SubscriptionNewMail(accessToken: string, mail:string): Promise<any> {
    const subscriptionEndpoint = 'https://graph.microsoft.com/v1.0/subscriptions';
    const notificationUrl = 'https://redfish-robust-roughly.ngrok-free.app/microsoft/webhook'
  
    const subscriptionDetails = {
      changeType: 'created,updated',
      notificationUrl: notificationUrl,
      resource: "/me/mailfolders('inbox')/messages",
      expirationDateTime: '2024-01-16T11:00:00.0000000Z',
      clientState: mail
    };
  
    try {
      const response = await axios.post(subscriptionEndpoint, subscriptionDetails, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data)
    } catch (error) {
      console.error('Erreur lors de la création de la souscription :', error.response?.data || error.message);
      throw error;
    }
  }

  async SendMail(info: MicrosoftEmail, accessToken: string) {
    const sendMailEndpoint = 'https://graph.microsoft.com/v1.0/me/sendMail';

    try {
      const response = await axios.post(
        sendMailEndpoint,
        {
          message: {
            toRecipients: [
              {
                emailAddress: {
                  address: info.destination,
                },
              },
            ],
            subject: info.subject,
            body: {
              content: info.bodymail,
              contentType: 'Text',
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de l'e-mail :",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

    async initToken(id: number, tokenOutlook: string) {
    try {
      const token: Token = await this.db.token.create({
        data: {
          Token: tokenOutlook,
          RefreshToken: tokenOutlook,
          TokenTimeValidity: '15mn',
        },
      });

      const outlook = await this.db.service.findFirst({
        where: {
          UserId: id,
          NameService: 'Outlook',
        },
      });
      
      const service = await this.db.service.update({
        where: {
          id: outlook.id,
          NameService: 'Outlook',
        },
        data: {
          TokenData: {
            connect: { id: token.id },
          },
        },
      });

      const tokenoutlook = await this.db.token.update({
        where: { id: token.id },
        data: {
          Service: {
            connect: { id: service.id },
          }
        }
      })
    } catch (err) {
      new InternalServerErrorException(
        'Erorr on add token in google service',
        err,
      );
    }
  }

  async ReactionOutlook(area: Area) {
  const service = await this.db.service.findFirstOrThrow({
    where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId
      }
    })
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }})
    this.SendMail({destination: area.ReactionParam[0], subject: area.ReactionParam[1], bodymail: area.ReactionParam[2]}, token.Token)
  }

  async ManagWebhookOutlookReaction(area: Area) {
    switch (area.Reaction_Service) {
      case 'Outlook':
        if (area.ReactionId === 0)
          this.ReactionOutlook(area)
      break
    }
  }

  async ManagWebhookOutlook(body: any) {
    const clientState = body.value[0].clientState;

    const areas = await this.db.area.findMany({
      where: {
        Action_Service: 'Outlook',
        ActionParam: {
          has: clientState
        },
      }
    })

    for (const area of areas) {
      this.reactionController(area, body)
    }
  }
}

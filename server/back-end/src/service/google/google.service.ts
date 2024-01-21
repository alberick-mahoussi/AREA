import { Injectable, UnauthorizedException, Body, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TokenDto } from 'src/auth/dto';
import { GoogleEmail, NewEventCalendar, NewEventSpecifiedCalendar } from '../../model/Google';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { Area, Token } from '@prisma/client';
import { calendar_v3, google } from 'googleapis';

@Injectable()
export class GoogleService {
  constructor(private config: ConfigService,
    private db:ConnectDbService) {}

  async exchangeCodeForToken(code: string): Promise<TokenDto> {
    try {
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.config.get('GOOGLE_WEB_ID'),
          client_secret: this.config.get('GOOGLE_WEB_SECRET'),
          redirect_uri: 'http://localhost:8081/google',
          grant_type: 'authorization_code',
        },
      );

      const accessToken = tokenResponse.data.access_token;
      const refreshToken = tokenResponse.data.refresh_token;
      const tokenDto = new TokenDto();
      tokenDto.Token = accessToken;
      tokenDto.RefreshToken = refreshToken;
      return tokenDto;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.response.data.error,
      );
      //throw new Error("Erreur lors de l'échange du code contre le token");
    }
  }

  async refreshGoogleAccessToken(refreshToken: string): Promise<string> {
    try {
      const clientId = this.config.get('GOOGLE_WEB_ID');
      const clientSecret = this.config.get('GOOGLE_WEB_SECRET');

      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        null,
        {
          params: {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          },
        },
      );
      const { access_token } = response.data;

      if (!access_token) {
        throw new UnauthorizedException(
          'Unable to refresh Google access token.',
        );
      }

      return access_token;
    } catch (error) {
      console.error('Error refreshing Google access token:', error);
      throw new UnauthorizedException('Unable to refresh Google access token.');
    }
  }

  async Sendemail(info: GoogleEmail, accessToken: string) {
    const to = info.destination;
    const subject = info.subject;
    const body = info.bodymail;

    const messageParts: string[] = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ];
    const rawMessage = Buffer.from(messageParts.join('\r\n')).toString(
      'base64',
    );

    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/send?access_token=${accessToken}`;

    try {
      const response = await axios.post(url, { raw: rawMessage });
      console.log('E-mail sent successfully.');
    } catch (error) {
      console.error('Error sending e-mail:', error);
      throw new Error('Failed to send e-mail');
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
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
        error.data,
      );
      throw new Error(
        "Erreur lors de la récupération des informations de l'utilisateur",
      );
    }
  }

  async initToken(id: number, tokengoogle:string) {
    try {
      const token: Token = await this.db.token.create({
        data: {
          Token: tokengoogle,
          RefreshToken: tokengoogle,
          TokenTimeValidity: '15mn',
        },
      });

      const gmail = await this.db.service.findFirst({
        where: {
          UserId: id,
          NameService: 'Gmail',
        },
      });
      
      const google_calenar = await this.db.service.findFirst({
        where: {
          UserId: id,
          NameService: 'Google Calendar',
        },
      });


      const serviceGmail = await this.db.service.update({
        where: {
          id: gmail.id,
          NameService: 'Gmail'
        },
        data: {
          TokenData: {
            connect: { id: token.id },
          },
        },
      });

      const serviceGoogleCalendar = await this.db.service.update({
        where: {
          id: google_calenar.id,
          NameService: 'Google Calendar'
        },
        data: {
          TokenData: {
            connect: { id: token.id },
          },
        },
      })

      const uploadGmail = await this.db.token.update({
        where: {
          id: token.id,
        },
        data: {
          Service: {
            connect: { id: serviceGmail.id },
          }
        }
      })

      const uploadCalendar = await this.db.token.update({
        where: {
          id: token.id,
        },
        data: {
          Service: {
            connect: { id: serviceGoogleCalendar.id },
          }
        }
      })

    } catch (err) {
      new InternalServerErrorException('Erorr on add token in google service', err);
    }
  }

  async GmailAddWebhook(accessToken: string) {
    console.log('add event');
    try {
      const response = await axios.post(
        'https://www.googleapis.com/gmail/v1/users/me/watch',
        {
          labelIds: ['INBOX'],
          topicName: 'projects/area-407421/topics/Mail',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
  
      console.log(response.data);
  
      if (response.status === 200) {
        console.log('Webhook configured successfully for response.data');
      } else {
        console.error('Failed to configure webhook for Status:', response.status, response.data);
      }
    } catch (error) {
      console.error('Error configuring webhook for user:', error.message);
      console.error('Error details:', error.response?.data);
    }
  }
  
  async ReactionGmail(area: Area) {
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId
      }
    })
    console.log(service.NameService, service.UserId, service.TokenId)
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }
    })
    if (area.ReactionId === 0)
      this.Sendemail({destination: area.ReactionParam[0], subject: area.ReactionParam[1], bodymail: area.ReactionParam[2]
    }, token.Token)
  }

  async GoogleCalendarWebhook(accessToken: string) {
    console.log('information')
    const url = this.config.get('EXTERNAL_URL');
    const webhookURL = `${url}/google/GoogleCalendar-webhook`;
    try {
      await axios.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch',
        {
          id: 'Calendar',
          type: 'web_hook',
          address: webhookURL,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (error) {
      console.error(
        'Erreur lors de la configuration du webhook pour Google Calendar:',
        error.response?.data || error.message,
      );
      throw new Error(
        'Échec de la configuration du webhook pour Google Calendar',
      );
    }
  }

  private launchCalendarApi(accessToken: string) {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    return calendar
  }

  
  async EventOnGmailWebhook(area: Area, body)
  {
    const reaction: string = area.Reaction_Service
    
    switch (reaction) {
      
    }
  }
  
  async ManagGmailWebhook(Body: any) {
    const areas = await this.db.area.findMany({
      where: {
        Action_Service: 'Gmail'
      }
    })
    for (const area of areas) {
      
    }
  }
  /*async ManagGoogleCalendarWebhook(Body: any) {
    const areas = await this.db.area.findMany({
      where: {
        Action_Service: 'Gmail'
      }
    })
    for (const area of areas) {
      
    }
  }*/

  convertDateFormat(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log(isoDate);
    return isoDate;
  }
  

  async createEvent(accessToken: string, event: NewEventCalendar) {
    const calendar = this.launchCalendarApi(accessToken);
  
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.Summary,
          description: event.Description,
          location: event.Location,
          colorId: '6',
          start: {
            date: event.Starttime,
          },
          end: {
            date: event.End_Time,
          },
        },
      });
  
      console.log('Événement créé :', response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async createEventSpecifiedCamendar(accessToken: string, event: NewEventSpecifiedCalendar) {
    const calendar = this.launchCalendarApi(accessToken);
  
    try {
      const response = await calendar.events.insert({
        calendarId: event.calendarid,
        requestBody: {
          summary: event.Summary,
          description: event.Description,
          location: event.Location,
          colorId: '6',
          start: {
            date: event.Starttime,
          },
          end: {
            date: event.End_Time,
          },
        },
      });
  
      console.log('Événement créé :', response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async createCalendar(accessToken: string, calendarSummary: string): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: accessToken });
  
    try {
      const response = await calendar.calendars.insert({
        requestBody: {
          summary: calendarSummary
        },
      });
  
      const newCalendarId = response.data.id;
      console.log(`Nouveau calendrier créé avec l'ID : ${newCalendarId}`);
      return newCalendarId;
    } catch (error) {
      console.error('Erreur lors de la création du calendrier :', error.message);
      throw error;
    }
  }

  async deleteEvent(accessToken: string, eventId: string) {
    const calendar = this.launchCalendarApi(accessToken);
  
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
  
      console.log(`Événement ${eventId} supprimé.`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement :', error);
    }
  }

  async deleteEventSpecifiedRepo(accessToken: string, eventId: string, calendarID: string) {
    const calendar = this.launchCalendarApi(accessToken);
  
    try {
      await calendar.events.delete({
        calendarId: calendarID,
        eventId: eventId,
      });
  
      console.log(`Événement ${eventId} supprimé.`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement :', error);
    }
  }

  async ReactionEventCalendar(area: Area) {
    console.log(area.UserId);
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId
      }
    })
    console.log(service.NameService, service.UserId, service.TokenId)
    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId
      }
    })

    switch (area.ReactionId) {
      case 0:
        this.createEvent(token.Token, {
          Summary: area.ReactionParam[0], Description: area.ReactionParam[1], Location: area.ReactionParam[2], Starttime: this.convertDateFormat(area.ReactionParam[3]), End_Time: this.convertDateFormat(area.ReactionParam[4])
        })
        break
        case 1:
          this.createEventSpecifiedCamendar(token.Token, {
            calendarid: area.ReactionParam[0], Summary: area.ReactionParam[1], Description: area.ReactionParam[2], Location: area.ReactionParam[3], Starttime: this.convertDateFormat(area.ReactionParam[4]), End_Time: this.convertDateFormat(area.ReactionParam[5])
          })
        break
        case 2:
          this.deleteEvent(token.Token, area.ActionParam[0])
        break
        case 4:
          this.createCalendar(token.Token, area.ActionParam[0])
        case 5:
          this.deleteEventSpecifiedRepo(token.Token, area.ActionParam[0], area.ActionParam[1])
    } 
  }
}

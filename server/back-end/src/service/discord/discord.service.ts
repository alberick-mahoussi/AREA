import { Injectable, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Area, Service } from '@prisma/client';
import { TokenDto } from 'src/auth/dto';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { MailService } from '../mail/mail.service';
import { Client, IntentsBitField, User } from 'discord.js'

@Injectable()
export class DiscordService {
  constructor(private config: ConfigService,
    private db: ConnectDbService,
    private mail: MailService) { }

    async exchangeCodeForToken(AutherizationCode: string): Promise<TokenDto> {
      const code = AutherizationCode
      if (code) {
        try {
          const data = {
            client_id: this.config.get('DISCORD_CLIENT_ID'),
            client_secret: this.config.get('DISCORD_CLIENT_SECRET'),
            code,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:8081/discord`,
            scope: 'identify email',
          }

          const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams(data),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          );
          const queryParams = new URLSearchParams(tokenResponse.data);
          const accessToken = queryParams.get('access_token');
          //const refreshToken = queryParams.get('refresh_token');
          const refreshToken = accessToken

          if (!accessToken || !refreshToken) {
            throw new Error("Access token or refreshtoken not found in the response");
          }
          const tokenDto = new TokenDto();
          tokenDto.Token = accessToken;
          tokenDto.RefreshToken = refreshToken;
          return tokenDto;
        } catch (error) {
          console.error(error);
        }
      }
    }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://discord.com/api/users/@me',
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

  async DiscordAddWebhook(wname: string, channel_id: string) {
    const ownerurl = this.config.get('EXTERNAL_URL')
    const botToken = this.config.get('DISCORD_BOT_TOKEN')
    try {
      const response = await axios.post(
        `https://discord.com/api/channels/${channel_id}/webhooks`,
        {
          name: wname,
          url: `${ownerurl}/discord/webhook`,
        },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error creating webhook:', error.message);
      return null;
    }
  }

  async DiscordRemoveWebhook(webhookId: string) {
    const url = `https://discord.com/api/channels/webhooks/${webhookId}`;
    const botToken = this.config.get('DISCORD_BOT_TOKEN')
    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      console.error('Error removing webhook:', error.message);
    }
  }

  async ManagWebhookAction(body: any) {
    const channel_id = body.channel_id;
    const areas = await this.db.area.findMany({
      where: {
        ActionParam: {
          has: channel_id
        },
        Action_Service: 'Discord'
      }
    })
    for (const area of areas) {
      if (area.Action_id === 0) {
        console.log("ManagWebhookAction")
        //this.SearchAction(area, body)
      }
    }
  }

  async ReactionDiscord(messageContent: string, area: Area) {

    switch (area.ReactionId) {
      case 0:
        await this.DiscordSendMessage(messageContent, area);
        break;
      case 1:
        await this.DiscordSendDirectMessage(messageContent, area);
        break;
      case 2:
        await this.DiscordSendChannelMessageWithMention(messageContent, area);
        break;
      case 3:
        await this.DiscordCreatePoll(messageContent, area);
        break;
      case 4:
        await this.DiscordSendDirectMessageToUser(messageContent, area);
        break;
    }
  }

  async DiscordSendMessage(content: string, area: Area) {
    const botToken = this.config.get('DISCORD_BOT_TOKEN')
    try {
      const response = await axios.post(
        `https://discord.com/api/v10/channels/${area.ReactionParam[0]}/messages`,
        {
          content: content,
        },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log('Discord message sent successfully.');
      } else {
        console.error('Failed to send message. Status code:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }

  async DiscordSendChannelMessageWithMention(messageContent: string, area: Area) {
    try {
      const mention = `<@${area.ReactionParam[1]}>`;
      const content = `${mention} ${messageContent}`;
      const botToken = this.config.get('DISCORD_BOT_TOKEN')
      const response = await axios.post(
        `https://discord.com/api/v10/channels/${area.ReactionParam[0]}/messages`,
        { content: content },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        console.log('Discord channel message with mention sent successfully.');
      } else {
        console.error('Failed to send message with mention. Status code:', response.status);
      }
    } catch (error) {
      console.error('Error sending message with mention:', error.message);
    }
  }

  convertStringToList(inputString) {
    if (inputString) {
      return inputString.split(',');
    } else {
      return [];
    }
  }

  async DiscordCreatePoll(messageContent: string, area: Area) {
    const botToken = this.config.get('DISCORD_BOT_TOKEN')
    const pollOptions = this.convertStringToList(area.ReactionParam[2]);
    try {
      let pollContent = `**Sondage :** ${area.ReactionParam[1]}\n\n`;
      pollOptions.forEach((option, index) => {
        pollContent += `${index + 1}. ${option}\n`;
      });
  
      const response = await axios.post(
        `https://discord.com/api/v10/channels/${area.ReactionParam[0]}/messages`,
        { content: pollContent },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        console.log('Poll created successfully.');
        for (let i = 0; i < pollOptions.length; i++) {
          await axios.put(
            `https://discord.com/api/v10/channels/${area.ReactionParam[0]}/messages/${response.data.id}/reactions/${encodeURIComponent(i + 1)}\u20E3/@me`,
            {},
            {
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      } else {
        console.error('Failed to create poll. Status code:', response.status);
      }
    } catch (error) {
      console.error('Error creating poll:', error.message);
    }
  } 

  async DiscordSendDirectMessageToUser(messageContent: string, area: Area): Promise<void> {
    try {
      const botToken = this.config.get('DISCORD_BOT_TOKEN');
      const client = new Client({
        intents: [IntentsBitField.Flags.DirectMessages],
      });
      await client.login(botToken);
  
      const recipientId = area.ReactionParam[0];
      const user = await client.users.fetch(recipientId);
  
      if (user) {
        await user.send(messageContent);
        console.log(`Direct message sent successfully to user ${user.tag}.`);
      } else {
        console.error('User not found.');
      }
      if (client && client.isReady()) {
        client.destroy();
      }
    } catch (error) {
      console.error('Error sending direct message to user:', error.message);
    }
  }
  

  async DiscordSendDirectMessage(messageContent: string, area: Area): Promise<void> {
    try {
      const client = new Client({
        intents: new IntentsBitField([
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.DirectMessages,
        ]),
      });
      const botToken = this.config.get('DISCORD_BOT_TOKEN')
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
      client.login(botToken)
      const userId = await this.getUserInfo(token.Token)
      const user = await client.users.fetch(userId.id);
      if (user) {
        await user.send(messageContent);
        console.log(`Message sent to ${user.tag}: ${messageContent}`);
      } else {
        console.error('User not found.');
      }
      if (client && client.isReady()) {
        client.destroy();
      }
    } catch (error) {
      console.error('Error sending direct message:', error.message);
    }
  }
}
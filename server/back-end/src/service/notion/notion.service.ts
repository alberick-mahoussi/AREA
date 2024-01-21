import { Client } from "@notionhq/client"
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { Injectable } from "@nestjs/common";
import { Area, Status } from "@prisma/client";
import axios from 'axios'
import { TokenDto } from "src/auth/dto";

@Injectable()
export class NotionService {
  constructor(
    private config: ConfigService,
    private db: ConnectDbService
  ) {}

  async CreateBlock(blockContents: string, area: Area) {
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
    const pageId = area.ReactionParam[0]
    const notion = new Client({ auth: token.Token })
    const blockId = pageId
    const styledLinkTextResponse = await notion.blocks.children.append({
      block_id: blockId,
      children: [
        {
          heading_3: {
            rich_text: [
              {
                text: {
                  content: "Tasktie : Reaction information",
                },
              },
            ],
          },
        },
        {
          paragraph: {
            rich_text: [
              {
                text: {
                  content:
                    blockContents,
                },
                annotations: {
                  bold: true,
                },
              },
            ],
          },
        },
      ],
    })
  }

  async CreateDatabase(dataContents: string, area: Area) {
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
    const pageId = area.ReactionParam[0]
    const apiKey = token.Token
    const notion = new Client({ auth: apiKey })
    const newDatabase = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: pageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: dataContents,
          },
        },
      ],
      properties: {
        "Tasktie Information": {
          type: "title",
          title: {},
        },
      },
    })
    console.log(newDatabase)
  }

  async AddCommentToDatabase(comment: string, area: Area) {
    const service = await this.db.service.findFirstOrThrow({
      where: {
        NameService: area.Reaction_Service,
        UserId: area.UserId,
      },
    });

    const token = await this.db.token.findUnique({
      where: {
        id: service.TokenId,
      },
    });

    const pageId = area.ReactionParam[0];
    const apiKey = token.Token;
    const notion = new Client({ auth: apiKey });
    if (pageId) {
      await notion.comments.create({
        parent: {
          page_id: pageId,
        },
        rich_text: [
          {
            type: "text",
            text: {
              content: comment,
            },
          },
        ],
      });
    } else {
      console.error("Database not found");
    }
  }

  async exchangeCodeForToken(AutherizationCode: string): Promise<TokenDto> {
    try {
      const client_id = this.config.get('NOTION_CLIENT_ID');
      const client_secret = this.config.get('NOTION_CLIENT_SECRET');
      const redirect_uri = 'http://localhost:8080/notion/callback';
      const url = 'https://api.notion.com/v1/oauth/token';
      const encoded = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

      const response = await axios.post(
        url,
        {
          grant_type: 'authorization_code',
          code: AutherizationCode,
          redirect_uri: redirect_uri,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Basic ${encoded}`,
          },
        }
      );
      const queryParams = new URLSearchParams(response.data);
      const accessToken = queryParams.get('access_token');
      const refreshToken = accessToken

      if (!accessToken || !refreshToken) {
        throw new Error("Access token or refreshtoken not found in the response");
      }
      const tokenDto = new TokenDto();
      tokenDto.Token = accessToken;
      tokenDto.RefreshToken = refreshToken;
      return tokenDto;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message, error.response?.data?.error_description
      );
      throw new Error("Erreur lors de l'échange du code contre le token");
    }
  }

  async ReactionNotion(messageContent: string, area: Area) {
    switch (area.ReactionId) {
      case 0:
        await this.CreateBlock(messageContent, area);
        break;
      case 1:
        await this.CreateDatabase(messageContent, area);
        break;
      case 2:
        await this.AddCommentToDatabase(messageContent, area);
        break;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoResponse = await axios.get(
        'https://api.notion.com/v1/users/me',
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
}

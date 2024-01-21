import { Body, Controller, Get, HttpStatus, InternalServerErrorException, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotionService } from './notion.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { TokenDto } from 'src/auth/dto';
import { Service, Token } from '@prisma/client';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';

@ApiTags('Notion Service')
@Controller('notion')
export class NotionController {
  constructor(
    private readonly authService: NotionService,
    private config: ConfigService,
    private db: ConnectDbService,
  ) {}

  @Get('auth')
  @ApiOperation({ summary: 'Method used to authenticate user with notion'})
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Redirect()
  notionLogin() {
      const authUrl = this.config.get('NOTION_AUTH_URL');
      return {url:authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT};
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback method used to authenticate user with notion'})
  @ApiParam({ name: 'code', description: 'authentification code of Notion', type: 'string'})
  @ApiParam({ name: 'state', description: 'authentification state', type: 'string' })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async NotionCallback(@Req() req: any, @Res() res: any) {
    const code = req.query.code as string;
    if (code) {
      try {
        const tokenDto: TokenDto = await this.authService.exchangeCodeForToken(code);
        console.log(tokenDto.Token)
      } catch (error) {
        console.error("Erreur lors de l'authentification :", error);
      }
    } else {
    }
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Authentication user notion access token" })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Several error' })
  @Post("SignupNotion")
  async AuthentificateNotion(@GetUser('id') id: number, @Body('Token') Token: string, res: any) {
    try {
      const token: Token = await this.db.token.create({
        data: {
            Token: Token,
            RefreshToken: Token,
            TokenTimeValidity: '15mn',
        },
    });
    const notion = await this.db.service.findFirst({
        where: {
            UserId: id,
            NameService: 'Notion'
        }
    })
    const service: Service = await this.db.service.update({
        where: {
            id: notion.id
        },
        data: {
            TokenData: {
                connect: { id: token.id }
            },
        }
    })
        } catch (err) {
            new InternalServerErrorException(err)
        }
    }
}

import { Body, Controller, Get, HttpStatus, InternalServerErrorException, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SpotifyService } from './spotify.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { TokenDto } from 'src/auth/dto';
import { Service, Token } from '@prisma/client';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';
import * as querystring from 'querystring';

@ApiTags('Spotify Service')
@Controller('spotify')
export class SpotifyController {
  constructor(
    private readonly authService: SpotifyService,
    private config: ConfigService,
    private db: ConnectDbService,
  ) {}

  @Get('auth')
  @ApiOperation({ summary: 'Method used to authenticate user with spotify'})
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Redirect()
  spotifyLogin() {
    const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
    const redirectUri = "http://localhost:8080/spotify/callback"
    const params = {
        'client_id': this.config.get('SPOTIFY_CLIENT_ID'),
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': redirectUri,
        'show_dialog': true
    }
    const authUrl = `https://accounts.spotify.com/authorize?` + querystring.stringify(params);
    return {url:authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT};
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback method used to authenticate user with spotify'})
  @ApiParam({ name: 'code', description: 'authentification code of Spotify', type: 'string'})
  @ApiParam({ name: 'state', description: 'authentification state', type: 'string' })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async SpotifyCallback(@Req() req: any, @Res() res: any) {
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
  @Post('SpotifyAuthregister')
  @ApiOperation({ summary: "Authentication user spotify access token" })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal Several error' })
  async spotifyauth(@GetUser('id') id: number, @Body('code') code:string) {
      try {
          const tokenspotify = await this.authService.exchangeCodeForToken(code)
          const token: Token = await this.db.token.create({
              data: {
                  Token: tokenspotify.Token,
                  RefreshToken: tokenspotify.RefreshToken,
                  TokenTimeValidity: '15mn',
              },
          });

          const spotify = await this.db.service.findFirst({
              where: {
                  UserId: id,
                  NameService: 'Spotify'
              }
          })
          const service: Service = await this.db.service.update({
              where: {
                  id: spotify.id
              },
              data: {
                  TokenData: {
                      connect: { id: token.id }
                  },
                  data: "0"
              }
          })
          await this.db.token.update({
              where: {
                  id: token.id
              },
              data: {
                  Service: {
                      connect: {id: service.id}
                  }
              }
          })
      } catch (err) {
          new InternalServerErrorException('Erorr on add token in spotify service', err);
      }
  }
}

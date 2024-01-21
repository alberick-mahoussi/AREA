import {
  Controller,
  Get,
  Req,
  Res,
  HttpStatus,
  Redirect,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TokenDto } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { Service, Token, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/service/mail/mail.service';
import * as argon from 'argon2';
import { Utils } from '../utils';

@ApiTags('Google Service')
@Controller('google')
export class GoogleController {
  constructor(
    private readonly authService: GoogleService,
    private config: ConfigService,
    private db: ConnectDbService,
    private AuthLocal: AuthService,
    private MailService: MailService,
    private Utils: Utils,
  ) {}

  @Get('auth')
  @Redirect()
  @ApiOperation({ summary: 'Method used to authenticate user with google' })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  googleLogin() {
    const clientId = this.config.get('GOOGLE_WEB_ID');
    const redirectUri = 'http://localhost:8080/google/callback';
    const responseType = 'code';
    const scope =
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

    // Construire l'URL d'authentification Google
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    // Rediriger l'utilisateur vers Google pour l'authentification
    return { url: authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT };
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Callback method used to authenticate user with google',
  })
  @ApiParam({
    name: 'code',
    description: 'authentification code of  GitHub',
    type: 'string',
  })
  @ApiParam({
    name: 'state',
    description: 'authentification state',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const code = req.query.code as string;
    console.log(code);

    if (code) {
      try {
        const tokenDto: TokenDto =
          await this.authService.exchangeCodeForToken(code);
        console.log('Token: ', tokenDto.Token);
        console.log('RefreshToken: ', tokenDto.RefreshToken);

        const userInfo = await this.authService.getUserInfo(tokenDto.Token);

        console.log("Informations de l'utilisateur:", userInfo);

        const user = await this.db.user.findUnique({
          where: { email: userInfo.email },
        });
        return {
          statusCode: HttpStatus.OK,
        };
      } catch (error) {
        console.error("Erreur lors de l'authentification :", error);
      }
    }
  }

  @Post('SigninGoogle')
  async AuthentifactGoogle(@Body() Token: any) {
    const code = Token.Token;
    console.log(code);
    const userInfo = await this.authService.getUserInfo(code);

    const user = await this.db.user.findUnique({
      where: {
        emailGoogle: userInfo.email,
      },
    });
    if (user) {
      const tokenlocal = await this.AuthLocal.signToken(user.id, user.email);
      return tokenlocal;
    } else {
      const userInfomation = await this.authService.getUserInfo(code);
      const password = this.Utils.generateRandomPassword();
      const hash = await argon.hash(password);
      const NewUser: User = await this.db.user.create({
        data: {
          username: userInfomation.name,
          email: userInfomation.email,
          emailGoogle: userInfomation.email,
          password: hash,
          picture: userInfomation.picture,
        },
      });
      this.AuthLocal.initUserService(NewUser.id);
      this.authService.initToken(NewUser.id, code);
      const token = this.AuthLocal.signToken(NewUser.id, NewUser.email);
      console.log(NewUser);
      this.MailService.sendEmailNewUser(
        password,
        NewUser.username,
        NewUser.email,
      );
      return token
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('RegisterGoogle')
  async registerGoogle(@GetUser('id') id: number, @Body('Token') Token: string) {
    console.log(Token);
    this.authService.initToken(id, Token);
  }
  
  @Post('Gmail-webhook')
  @ApiOperation({
    summary: 'Webhook of gmail use to manage event on mail',
  })
  async GmailWebhook(@Req() req: Request, @Res() res: Response) {
    console.log(req.body);
  }

  @Post('GoogleCalendar-webhook')
  @ApiOperation({
    summary: 'Webhook of google calendar use to manage event',
  })
  async CalendarWebhook(@Req() req: Request, @Res() res: Response) {}
}

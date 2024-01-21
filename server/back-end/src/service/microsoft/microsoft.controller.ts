import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Redirect,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicrosoftService } from './microsoft.service';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { AuthService } from 'src/auth/auth.service';
import * as argon from 'argon2';
import { Utils } from '../utils';
import { MailService } from '../mail/mail.service';
import { Request, Response } from 'express';

@ApiTags('Microsoft Service')
@Controller('microsoft')
export class MicrosoftController {
  constructor(
    private readonly authService: MicrosoftService,
    private config: ConfigService,
    private db: ConnectDbService,
    private AuthLocal: AuthService,
    private Utils: Utils,
    private MailService: MailService,
  ) {}

  @Post('SigninMicrosoft')
  @ApiOperation({
    summary: 'method used to signup or login in application with outlook',
  })
  @ApiParam({
    name: 'code',
    description: 'authentification code of  Outlook',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async signupMicrosoftt(@Body('code') code: string) {
    const token = await this.authService.exchangeCodeForToken(code);
    const userInfo = await this.authService.getUserInfo(token);
    const user = await this.db.user.findUnique({
      where: {
        emailMicrosoft: userInfo.mail,
      },
    });
    if (user) {
      const tokenlocal = await this.AuthLocal.signToken(user.id, user.email);
      return tokenlocal;
    } else {
      const password = this.Utils.generateRandomPassword();
      const hash = await argon.hash(password);
      const Newuser = await this.db.user.create({
        data: {
          username: userInfo.displayName,
          email: userInfo.mail,
          emailMicrosoft: userInfo.mail,
          password: hash,
        },
      });
      this.AuthLocal.initUserService(Newuser.id);
      this.authService.initToken(Newuser.id, token);
      const Token = this.AuthLocal.signToken(Newuser.id, Newuser.email);
      this.MailService.sendEmailNewUser(
        password,
        Newuser.username,
        Newuser.email,
      );
      return Token;
    }
  }

  @ApiOperation({
    summary: 'method used to signup or login in application with outlook',
  })
  @ApiParam({
    name: 'code',
    description: 'authentification code of  Outlook',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Aunthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('RegisterOutlook')
  async outlookauthentification(
    @GetUser('id') id: number,
    @Body('code') code: string,
  ) {
    const token = await this.authService.exchangeCodeForTokenRegister(code);

    const Token = await this.db.token.create({
      data: {
        Token: token,
        RefreshToken: token,
        TokenTimeValidity: '15mn',
      },
    });

    const service = await this.db.service.findFirst({
      where: {
        UserId: id,
        NameService: 'Outlook',
      },
    });

    const udpate = await this.db.service.update({
      where: {
        id: service.id,
      },
      data: {
        TokenData: {
          connect: { id: Token.id },
        },
      },
    });

    const updateToken = await this.db.token.update({
      where: {
        id: Token.id,
      },
      data: {
        Service: {
          connect: { id: udpate.id },
        },
      },
    });
  }

  @ApiOperation({
    summary: 'method used to signup or login in application with outlook',
  })
  @ApiParam({
    name: 'code',
    description: 'authentification code of  Outlook',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Aunthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('SigninMicrosoftMobile')
  async signupMicrosoftMobile(@Body('Token') Token: string) {
    const userInfo = await this.authService.getUserInfo(Token);
    const user = await this.db.user.findUnique({
      where: {
        emailMicrosoft: userInfo.mail,
      },
    });

    if (user) {
      const tokenlocal = await this.AuthLocal.signToken(user.id, user.email);
      return tokenlocal;
    } else {
      const password = this.Utils.generateRandomPassword();
      const hash = await argon.hash(password);
      const userInformation = await this.authService.getUserInfo(Token);
      const NewUser = await this.db.user.create({
        data: {
          username: userInformation.displayName,
          email: userInformation.mail,
          emailMicrosoft: userInformation.mail,
          password: hash,
        },
      });
      this.AuthLocal.initUserService(NewUser.id);
      this.authService.initToken(NewUser.id, Token);
      const token = this.AuthLocal.signToken(NewUser.id, NewUser.email);
      this.MailService.sendEmailNewUser(
        password,
        NewUser.username,
        NewUser.email,
      );
      return token
      }
    }

  @ApiOperation({
      summary: 'method used to subscribe auth service outlook on mobile',
  })
  @ApiParam({
    name: 'code',
    description: 'authentification code of  Outlook',
      type: 'string',
  })
  @ApiResponse({ status: 200, description: 'User Found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Aunthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('RegisterOutlookMobile')
  async outlookauthentificationMobile(@GetUser('id') id: number, @Body('Token') Token: string) {
    const token = await this.db.token.create({
      data: {
        Token: Token,
        RefreshToken: Token,
        TokenTimeValidity: '15mn',
      },
    });

    const service = await this.db.service.findFirst({
      where: {
        UserId: id,
        NameService: 'Outlook',
      },
    });

    const udpate = await this.db.service.update({
      where: {
        id: service.id,
      },
      data: {
        TokenData: {
          connect: { id: token.id },
        },
      },
    });

    const updateToken = await this.db.token.update({
      where: {
        id: token.id,
      },
      data: {
        Service: {
          connect: { id: udpate.id },
        },
      },
    });
  }

  @Post('webhook')
  async OutlookWebhook(@Req() req: Request, @Res() res: Response) {
    const valid = req.query.validationToken;
    if (valid) {
      res.status(200).send(valid);
    } else {
      res.status(200).send('OK');
    }
  }
}

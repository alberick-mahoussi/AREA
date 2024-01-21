import {
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConnectDbService } from '../connect-db/connect-db.service';
//import { User, Service } from '@prisma/client';
import {
  AuthDtoRegitser,
  AuthDtoLogin,
  AuthDtoUsername,
  AuthDtoRecoveryPassword,
  AuthDtoEmail,
} from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable({})
export class AuthService {
  constructor(
    private db: ConnectDbService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async Signup(dto: AuthDtoRegitser) {
    //generate hash password
    const hash = await argon.hash(dto.password);
    // save user in db
    try {
      const user = await this.db.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: hash,
        },
      });
      this.initUserService(user.id);
      const token = this.signToken(user.id, user.email);
      console.log(token);
      return token;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Sorry this email has used');
        }
      }
    }
  }

  async Signin(dto: AuthDtoLogin) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Sorry this user or email don`t exist');
    }

    const passwordVerify = await argon.verify(user.password, dto.password);
    if (!passwordVerify) {
      throw new ForbiddenException(
        'Sorry incorrect password for this email verify password',
      );
    }
    const token = this.signToken(user.id, user.email);
    return token;
  }

  async User_auhentifcation(dto: AuthDtoEmail) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Sorry this user or email don`t exist');
    }
    return user.email;
  }

  async RecoveryPassword(dto: AuthDtoRecoveryPassword) {
    const hash = await argon.hash(dto.password);

    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hash,
        },
      });
    } else {
      throw new Error('Utilisateur non trouvé.');
    }
  }

  async signToken(
    idUser: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: idUser,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const expiresIn = '1d';

    const token = this.jwt.sign(payload, { expiresIn, secret });
    return {
      access_token: token,
    };
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    const secret = this.config.get('JWT_SECRET');
    const expiresIn = '1d';

    const payload = this.jwt.verify(token, { secret });
    const tokenRefreshed = this.jwt.sign(payload, { expiresIn, secret });
    return {
      access_token: tokenRefreshed,
    };
  }

  async initUserService(idUser: number) {
    const filePath = join(__dirname, '..', '..', 'src/about/about.json');
    try {
      const aboutData = fs.readFileSync(filePath, 'utf-8');
      const jsonContent = JSON.parse(aboutData);
      const services = jsonContent.server.services;

      services.forEach(async (service, index) => {
        const serviceName: string = service.name;
        const reqauth: boolean = service.authentification;
        const availablewebhooks: boolean = service.AvailableWebhook;
        const newservice = await this.db.service.create({
          data: {
            NameService: serviceName,
            RequiresAuth: reqauth,
            User: {
              connect: { id: idUser },
            },
            AvailableWebhook: availablewebhooks,
          },
        });
        const updatedUser = await this.db.user.update({
          where: { id: idUser },
          data: {
            services: {
              connect: { id: newservice.id },
            },
          },
        });
      });
    } catch (err) {
      console.log({ error: 'Failed to retrieve about information' });
    }
  }
}

import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategy';
import { MailService } from '../mail/mail.service';
import { Utils } from '../utils';

@Module({
  imports: [ConnectDbModule, JwtModule.register({})],
  controllers: [GoogleController],
  providers: [GoogleService, AuthService, JwtStrategy, MailService, Utils],
})
export class GoogleModule {}

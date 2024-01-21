import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategy';

@Module({
  imports: [ConnectDbModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

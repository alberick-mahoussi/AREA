import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { ConnectDbModule } from 'src/connect-db/connect-db.module';
import { SpotifyService } from './spotify.service';

@Module({
  imports: [ConnectDbModule],
  controllers: [SpotifyController],
  providers: [SpotifyService]
})
export class SpotifyModule {}

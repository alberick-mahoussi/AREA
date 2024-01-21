import { Controller, Get, Res, Body, Post} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';
import { AreaDto } from './auth/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('mobile-apk')
  @ApiOperation({ summary: 'Get a mobile app'})
  @ApiResponse({ status: 200, description: 'OK' })
  async downloadApk(@Res() res: Response): Promise<void> {
    const apkPath = join(__dirname, '..', '..', 'apk', 'client.apk');
    res.download(apkPath, 'client.apk');
  }
}

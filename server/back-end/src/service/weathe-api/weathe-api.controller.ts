import { Injectable, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Area } from "@prisma/client"
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { WeatherService } from './weathe-api.service';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';

@ApiTags('Weather Service')
@Controller('Weather')
export class WeatherController {
    constructor(
        private config: ConfigService,
        private db: ConnectDbService,
        private readonly WeatherService: WeatherService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('AddService')
    @ApiOperation({ summary: 'Register Weather Service' })
    @ApiResponse({ status: 200, description: 'Ok' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async AddService(@GetUser('id') id: number) {
        return this.WeatherService.addWeatherService(id);
    }

}

import { Controller, UseGuards, Post} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { TimeService } from './time.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';

@ApiTags('Time Service')
@Controller('time')
export class TimeController {
    constructor(
        private config: ConfigService,
        private db: ConnectDbService,
        private readonly TimeService: TimeService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('AddService')
    @ApiOperation({summary: 'Register Weather Service'})
    @ApiResponse({status: 200, description: 'Ok'})
    @ApiResponse({status: 400, description: 'Bad request'})
    @ApiResponse({status: 401, description: 'Unauthorized'})
    async AddService(@GetUser('id') id: number) {
        return this.TimeService.addTimerService(id);
    }
}

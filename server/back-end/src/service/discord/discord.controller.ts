import {
    Controller,
    Get,
    Req,
    Res,
    HttpStatus,
    Redirect,
    Post,
    UseGuards,
    Body,
    HttpCode,
    InternalServerErrorException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscordService } from './discord.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { TokenDto } from '../../auth/dto/auth.dto';
import { Service, Token } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';

@ApiTags('Discord Service')
@Controller('discord')

export class DiscordController {
    constructor(
        private readonly authService: DiscordService,
        private config: ConfigService,
        private db: ConnectDbService,
    ) { }

    @Get('auth')
    @ApiOperation({ summary: 'Method used to authenticate user with discord' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @Redirect()
    discordLogin() {
        const authUrl = this.config.get('DISCORD_AUTH_URL')
        return { url: authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT };
    }

    @Get('callback')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Callback method used to authenticate user with discord' })
    @ApiParam({ name: 'code', description: 'authentification code of  Discord', type: 'string' })
    @ApiParam({ name: 'state', description: 'authentification state', type: 'string' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async DiscordCallback(@Req() req: any, @Res() res: any) {
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
    @ApiOperation({ summary: "Authentication user discord access token" })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Several error' })
    @Post("SignupDiscord")
    async AuthentificateDiscord(@GetUser('id') id: number, @Body('Token') Token: string, res: any) {
        console.log(Token)
        try {
            const token: Token = await this.db.token.create({
                data: {
                    Token: Token,
                    RefreshToken: Token,
                    TokenTimeValidity: '15mn',
                },
            });

            const discord = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Discord'
                }
            })

            const service: Service = await this.db.service.update({
                where: {
                    id: discord.id
                },
                data: {
                    TokenData: {
                        connect: { id: token.id }
                    },
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
            new InternalServerErrorException('Erorr on add token in discord service', err)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('DiscordAuthregister')
    @ApiOperation({ summary: "Authentication user discord access token" })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Several error' })
    async discordauth(@GetUser('id') id: number, @Body('code') code:string) {
        try {
            const tokendiscord = await this.authService.exchangeCodeForToken(code)
            const token: Token = await this.db.token.create({
                data: {
                    Token: tokendiscord.Token,
                    RefreshToken: tokendiscord.RefreshToken,
                    TokenTimeValidity: '15mn',
                },
            });

            const discord = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Discord'
                }
            })
            const service: Service = await this.db.service.update({
                where: {
                    id: discord.id
                },
                data: {
                    TokenData: {
                        connect: { id: token.id }
                    },
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
            new InternalServerErrorException('Erorr on add token in github service', err);
        }
    }
    @Post('webhook')
    @ApiOperation({ summary: 'webhook method of discord' })
    @ApiResponse({ status: 200, description: 'User information returned' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async DiscordWebhook(@Req() req: Request, @Res() res: Response) {
        res.status(202).send('Accepted');
        this.authService.ManagWebhookAction(req.body)
    }
}

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
import { GithubService } from './github.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { TokenDto } from '../../auth/dto/auth.dto';
import { Service, Token } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Github Service')
@Controller('github')

export class GithubController {
    constructor(
        private readonly authService: GithubService,
        private config: ConfigService,
        private db: ConnectDbService,
    ) { }

    @Get('auth')
    @ApiOperation({ summary: 'Method used to authenticate user with github' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @Redirect()
    githubLogin() {
        const clientId = this.config.get('GITHUB_CLIENT_ID');
        const redirectUri = 'http://localhost:8080/github/callback';
        const scope =
            'notifications user repo:status public_repo read:org project repo admin:repo_hook admin:org_hook';

        // Construire l'URL d'authentification Github
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        return { url: authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT };
    }

    @Get('callback')
    //@UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Callback method used to authenticate user with github' })
    @ApiParam({ name: 'code', description: 'authentification code of  GitHub', type: 'string' })
    @ApiParam({ name: 'state', description: 'authentification state', type: 'string' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async GithubCallback(@Req() req: any, @Res() res: any) {
        const code = req.query.code as string;

        if (code) {
            try {
                const tokenDto: TokenDto = await this.authService.exchangeCodeForToken(code);
                const userInfo = await this.authService.getUserInfo(tokenDto.Token);
                console.log(tokenDto.Token)
                console.log("Informations de l'utilisateur:", userInfo);
            } catch (error) {
                console.error("Erreur lors de l'authentification :", error);
            }
        } else {
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Authentication user github access token" })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 500, description: 'Internal Several error' })
    @Post("SignupGithub")
    async AuthentificateGithub(@GetUser('id') id: number, @Body('Token') Token: string, res: any) {
        try {
            const token: Token = await this.db.token.create({
                data: {
                    Token: Token,
                    RefreshToken: Token,
                    TokenTimeValidity: '15mn',
                },
            });

            const github = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Github'
                }
            })

            const service: Service = await this.db.service.update({
                where: {
                    id: github.id
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

    @UseGuards(JwtAuthGuard)
    @Post("GithubAuthregister")
    async Githubauthregister(@GetUser('id') id:number, @Body('code') code:string) {
        console.log(code)
        try {
            const tokengithub = await this.authService.exchangeCodeForToken(code)
            const token: Token = await this.db.token.create({
                data: {
                    Token: tokengithub.Token,
                    RefreshToken: tokengithub.RefreshToken,
                    TokenTimeValidity: '15mn',
                },
            });

            const github = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Github'
                }
            })

            const service: Service = await this.db.service.update({
                where: {
                    id: github.id
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
    @ApiOperation({ summary: 'webhook method of github' })
    @ApiResponse({ status: 200, description: 'User information returned' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async GithubWebhook(@Req() req: Request, @Res() res: Response) {
        const event = req.headers['x-github-event']
        console.log(event)
        res.status(202).send('Accepted');
        if (typeof event === 'string') {
            this.authService.ManagWebhookAction(event, req.body)
        }
    }

}
import { Controller, Get, Post, Redirect, HttpStatus, Req, Res, UseGuards, InternalServerErrorException, Body } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger';
import { TokenDto } from 'src/auth/dto';
import { GetUser } from 'src/auth/decorator';
import { JwtAuthGuard } from 'src/Guard/Jwt.guard';
import { Service, Token } from '@prisma/client';
import { Request, Response } from 'express';

@ApiTags("Gitlab Service")
@Controller('gitlab')
export class GitlabController {
    constructor(
        private readonly authService: GitlabService,
        private config: ConfigService,
        private db: ConnectDbService,
    ) { }

    @Get('auth')
    @Redirect()
    gitlabbLogin() {
        const clientId = this.config.get('GITLAB_CLIENT_ID');
        const redirectUri = 'http://localhost:8080/gitlab/callback';
        const scope =
            'read_api read_user read_repository write_repository read_registry write_registry read_observability write_observability profile email'

        
        const authUrl = `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
        return { url: authUrl, statusCode: HttpStatus.TEMPORARY_REDIRECT };
    }

    @Get('callback')
    async GitlabCallback(@Req() req: any, @Res() res: any) {
        const code = req.query.code as string;

        if (code) {
            try {
                const accessToken = await this.authService.exchangeCodeForToken(code);
                console.log(accessToken);
                const userInfo = await this.authService.getUserInfo(accessToken);
                console.log("Informations de l'utilisateur:", userInfo);
            } catch (error) {
                console.error("Erreur lors de l'authentification :", error);
            }
        } else {
        }
        res.redirect('http://localhost:8080/');
    }

    @UseGuards(JwtAuthGuard)
    @Post("SignupGitlab")
    @ApiOperation({ summary: 'Method used to save Gitlab user token' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async AuthentificateGitlab(@GetUser('id') id: number, @Body('Token') Token: string, res: any) {
        console.log(Token)
        try {
            const token: Token = await this.db.token.create({
                data: {
                    Token: Token,
                    RefreshToken: Token,
                    TokenTimeValidity: '15mn',
                },
            });

            const gitlab = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Gitlab'
                }
            })

            const service: Service = await this.db.service.update({
                where: {
                    id: gitlab.id
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
            new InternalServerErrorException(err)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('GitlabAuthregister')
    @ApiOperation({ summary: 'Method used to authentificate with Gitlab code' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async Gitlabwebregister(@GetUser('id') id:number, @Body('code') code:string) {
        console.log(code)
        const tokengilab = await this.authService.exchangeCodeForToken(code)
        try {
            const token: Token = await this.db.token.create({
                data: {
                    Token: tokengilab,
                    RefreshToken: tokengilab,
                    TokenTimeValidity: '15mn',
                },
            });

            const gitlab = await this.db.service.findFirst({
                where: {
                    UserId: id,
                    NameService: 'Gitlab'
                }
            })

            const service: Service = await this.db.service.update({
                where: {
                    id: gitlab.id
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
            new InternalServerErrorException(err)
        }
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Method used for creation of a webhook for Gitlab' })
    @ApiResponse({ status: 200, description: 'User Found' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async GitlabWebhook(@Req() req: Request, @Res() res: Response) {
        console.log(req.body)
        const event = req.body.object_kind
        console.log(req.body.object_kind)
        res.status(202).send('Accepted');
        if (typeof event === 'string') {
            this.authService.ManagWebhookAction(event, req.body)
        }
    }
}

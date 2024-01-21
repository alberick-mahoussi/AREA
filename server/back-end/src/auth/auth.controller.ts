import { Body, Controller, Post, Get, Req, UseGuards, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response} from 'express';
import { AuthDtoRegitser, AuthDtoLogin, AuthDtoUsername, AuthDtoRecoveryPassword, AuthDtoEmail } from './dto';
import { ConnectDbService } from '../connect-db/connect-db.service';
import {ApiTags, ApiOperation, ApiResponse, ApiBody} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private db: ConnectDbService) {}

    /**
     * Method to signup on application
     * @param dto dto object xontain username, email and password of user who want to signin
     * @returns status ok when successful or error when bad request
     */
  @Post('signup')
  @ApiOperation({summary: 'Method used to register a new user'})
  @ApiResponse({status: 200, description: 'User created'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  //@ApiResponse({status: 404, description: 'Not found'})
  @ApiBody({ type: AuthDtoRegitser })
  signup(@Body() dto: AuthDtoRegitser) {
    console.log({
      dto,
    });
    return this.authService.Signup(dto);
  }

  /**
   * Methode to given to user for login to account
   * @param dto dto object who containts mail and password od user who want to signin
   * @returns status 201 ok when successful or error when bad request or bad token
   */
  @Post('signin')
  @ApiOperation({summary: 'Method used to sign in an existing user'})
  @ApiResponse({status: 200, description: 'User signed in'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  @ApiBody({ type: AuthDtoLogin })
  @ApiResponse({status: 404, description: 'Not found'})
  signin(@Body() dto: AuthDtoLogin) {
    console.log({
      dto,
    });
    return this.authService.Signin(dto);
  }

  /**
   * Method to confirm exsistent user for recovery password
   * @param dto contain email of user who want to forget password
   * @returns status 201 ok when successful or error when bad request or bad token
   */
  @Post('UserAuthenfication')
  @ApiOperation({summary: 'Method used to authenticate an existing user with email'})
  @ApiResponse({status: 200, description: 'User Found'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  checkUserEmail(@Body() dto: AuthDtoEmail) {
    console.log({
      dto,
    });
    return this.authService.User_auhentifcation(dto);
  }

  /**
   * Method to recovery password after Authentificate email
   * @param dto contain email of user who want to recovery her password
   * @returns status 201 ok when successful or error when bad request
   */
  @Post('RecoveryPassword')
  @ApiBody({description: 'Method used to recover password of user with email and new password' })
  @ApiResponse({status: 200, description: 'OK'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  RecoveryPassword(@Body() dto: AuthDtoRecoveryPassword) {
    console.log({
      dto,
    });
    return this.authService.RecoveryPassword(dto);
  }

  /**
   * Methid to logout user 
   * @param req token of user
   * @param res status 201 ok when successful or error when bad request or bad token<
   *  
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({summary: 'Method used to deconnect existing user'})
  @ApiResponse({status: 200, description: 'User deconnect'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @Post('logout')

  async logout(@Req() req: Request, res: Response) {
    const user = req.user;
      // Récupérer les areas de l'utilisateur
      const userAreas = await this.db.area.findMany({
        where: { UserId: req.body.user.id},
      });
      
      // Parcourir chaque area et les désactiver (mettre à jour le statut, par exemple)
      if (userAreas && userAreas.length > 0) {
        for (const area of userAreas) {
          await this.db.area.update({
            where: { Id: area.Id },
            data: { state: 'OFF' }, // Assurez-vous d'ajuster le statut selon vos besoins
          });
        }
      }
    // Récupérer les services de l'utilisateur
    const userService = await this.db.service.findMany({
      where: { UserId: req.body.user.id},
    });
    res.status(200).json({ message: `L'utilisateur est déconnecté.` });
  }
}
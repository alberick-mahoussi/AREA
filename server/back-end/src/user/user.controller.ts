import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../Guard/Jwt.guard';
import { UserService } from './user.service';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import { AreaDto, AuthDtoUsername, DiseableDto } from 'src/auth/dto';
import { User, Service } from '@prisma/client';
import { GetUser } from '../auth/decorator/UserInformation.deocrator';
import { PasswordDto, PictureDto } from '../auth/dto/auth.dto';
import * as argon from 'argon2';

@ApiTags('Users Service')
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private db: ConnectDbService,
  ) {}

  /**
   * Method to  get user information
   * @param req credentials token of user
   * @param res status 200 and json responce containing user information or status 401 when user is not authentificate
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    console.log({
      user,
    });
    res.status(200).json({ user });
  }

  /**
   * Method to get A list of area creat by user
   * @param req credential token of user
   * @returns status 200 and json responce containing the area ctreat by user or status 401 when user in not authentificate
   */
  @UseGuards(JwtAuthGuard)
  @Get('UserArea')
  @ApiOperation({ summary: 'Method for getting user area information' })
  @ApiResponse({ status: 200, description: 'Areas Information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  UserArea(@GetUser('id') id: number) {
    return this.userService.getUsersAreas(id);
  }

  /**
   * Method to get a list of service subscribe by user
   * @param req credential token of user
   * @returns  status 200 and json responce containing the service subscribe by user or staus 401 when user is not authentificate
   */
  @UseGuards(JwtAuthGuard)
  @Get('UserService')
  @ApiOperation({ summary: 'Method for getting user area information' })
  @ApiResponse({ status: 200, description: 'Areas Information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  UserService(@Req() req: Request) {
    console.log({
      user: req.user,
    });
    return this.userService.getUsersServices(req.body.user.id);
  }

  /**
   * Method to creaete a new area
   * @param dto AreaDto containing info of new area which is name of Service action and Service reaction, id of action and reaction choose from each service  and param for different action and reaction
   * @param id id of user determined by the creditential token give by user
   * @returns retur 201 status when successful, 401 when not authenticated or 403 when he don't have the service required
   */
  @UseGuards(JwtAuthGuard)
  @Post('CreateArea')
  //@HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Method for creating new area' })
  @ApiResponse({ status: 201, description: 'Area created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: AreaDto })
  createArea(@Body() dto: AreaDto, @GetUser('id') id: number) {
    console.log({ id, dto });
    return this.userService.InsertArea(id, dto);
  }

  /**
   * Method for updating state of a user specific area with id
   * @param areaId Id of the area whose state you want to update
   *
   */

  @UseGuards(JwtAuthGuard)
  @Post('UpdateStateArea')
  @ApiOperation({ summary: 'Method for update a user area state' })
  @ApiResponse({ status: 200, description: 'Area created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStateArea(@GetUser('id') id: number, areaId: number) {
    const area = await this.db.area.findFirst({
      where: { Id: areaId, UserId: id },
    });
    if (area) {
      if (area.state === 'ON')
        await this.db.area.update({
          where: { Id: area.Id },
          data: { state: 'OFF' },
        });
      else
        await this.db.area.update({
          where: { Id: area.Id },
          data: { state: 'ON' },
        });
    } else {
      new ForbiddenException('Invalid id area');
    }
  }

  /**
   *
   * Method to  Delete a specific Area of the specific user
   * @param areaId id of the Area to delete
   * @returns statsus 200 on success or 401 for unauthorized access error or 403 for forbidden access error
   */
  @UseGuards(JwtAuthGuard)
  @Post('DeleteArea')
  @ApiOperation({ summary: 'Method for delete a user area' })
  @ApiResponse({ status: 200, description: 'Area created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async DeleteArea(@GetUser('id') id: number, @Body('areaId') areaId: number) {
    const user = await this.db.user.findUnique({
      where: {
        id: id,
      },
      include: {
        areas: true,
      },
    });

    if (!user) {
      console.log('Utilisateur non trouvé.');
      return;
    }

    const areaToRemove = user.areas.find((area) => area.Id === areaId);

    if (!areaToRemove) {
      console.log("L'utilisateur n'est pas connecté à cette zone.");
      new ForbiddenException('Invalid area');
      return;
    }

    const deletedArea = await this.db.area.delete({
      where: {
        Id: areaId,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('DiseableService')
  @ApiOperation({ summary: 'Method to subscribe services diseable' })
  @ApiResponse({ status: 200, description: 'Area created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async DiseableService(@GetUser('id') id: number, @Body() dto: DiseableDto) {
    const user_with_setting = await this.db.user.findUnique({
      where: { id: id },
      include: {
        Settings: true,
      },
    });

    const user: User = await this.db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user_with_setting.Settings != undefined) {
      const set = await this.db.settings.update({
        where: {
          id: user_with_setting.Settings.id,
        },
        data: {
          serviceDisabled: dto.ServiceDiseable,
        },
      });
      console.log('update', set.serviceDisabled);
    } else if (user) {
      const Newsetting = await this.db.settings.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          serviceDisabled: dto.ServiceDiseable,
        },
      });

      const updat = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          Settings: {
            connect: { id: Newsetting.id },
          },
        },
      });
      console.log('new', Newsetting.serviceDisabled);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('ListServiceDiseabled')
  @ApiOperation({ summary: 'Method to Get services diseable' })
  @ApiResponse({ status: 200, description: 'Area created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async servicediseables(@Req() @GetUser('id') id: number): Promise<string[]> {
    const user = await this.db.user.findUnique({
      where: { id: id },
      include: {
        Settings: true,
      },
    });
    if (user.Settings) {
      return user.Settings.serviceDisabled;
    } else return [];
  }

  @UseGuards(JwtAuthGuard)
  @Post('UpdateUserUsername')
  @ApiOperation({ summary: 'Method to Update user email' })
  @ApiBody({ type: AuthDtoUsername })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateEmail(
    @Req() @GetUser('id') id: number,
    @Body() dto: AuthDtoUsername,
  ) {
    const user: User = await this.db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user) {
      const updat = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          username: dto.username,
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('UpdatePassword')
  @ApiOperation({ summary: 'Method to Update user password' })
  @ApiBody({ type: PasswordDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePassword(
    @Req() @GetUser('id') id: number,
    @Body() dto: PasswordDto,
  ) {
    const user: User = await this.db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user) {
      const hash = await argon.hash(dto.password);
      const updat = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hash,
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('UpdatePicture')
  @ApiOperation({ summary: 'Method to Update user picture profil' })
  @ApiBody({ type: PictureDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePicture(
    @Req() @GetUser('id') id: number,
    @Body() dto: PictureDto,
  ) {
    const user: User = await this.db.user.findUnique({
      where: {
        id: id,
      },
    });
    if (user) {
      const updat = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          picture: dto.picture,
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('AuthenticatorChecker')
  @ApiOperation({
    summary: 'Method to verify authentifaction of service request by id',
  })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async authentificator(@GetUser('id') id: number, @Body('name') name: string) {
    console.log(name)
    const user = await this.db.user.findUnique({
      where: {
        id: id,
      },
      include: {
        services: true,
      },
    });

    if (user) {
      const serv = user.services.find(
        (service) => service.NameService === name
      )
      if (serv.TokenId === null) {
        console.log('false1')
        return {authentification: false}
      } else {
        // console.log(serv.TokenId)
        console.log('true1')
        return {authentification:true}
      }
    }
  }
}

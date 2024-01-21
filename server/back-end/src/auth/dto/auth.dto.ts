import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDtoRegitser {
  @ApiProperty({
    name: 'Email',
    description: 'Email of the user',
    type: 'string',
    example: 'area@gmail.com',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    name: 'Email',
    description: 'Email of the user',
    type: 'string',
    example: 'area@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'Password',
    description: 'Password of the user',
    type: 'string',
    example: 'area',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthDtoLogin {
  @ApiProperty({
    name: 'Email',
    description: 'Email of the user',
    type: 'string',
    example: 'area@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'Password',
    description: 'Password of the user',
    type: 'string',
    example: 'area',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthDtoUsername {
  @ApiProperty({
    name: 'Username',
    description: 'Username of the user who wants to recover his password',
    type: 'string',
    example: 'tasktie',
  })
  @IsNotEmpty()
  username: string;
}

export class AuthDtoEmail {
  @ApiProperty({
    name: 'Email',
    description: 'Email of the user who wants to recover his password',
    type: 'string',
    example: 'area@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AuthDtoRecoveryPassword {
  @ApiProperty({
    name: 'Email',
    description: 'Email of the user',
    type: 'string',
    example: 'area@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'Password',
    description: 'New password of the user',
    type: 'string',
    example: 'area',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class WeatherCity {
  @ApiProperty({
    name: 'City',
    description: 'Name of the city',
    type: 'string',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;
}

export class AreaDto {
  ActionId: string;
  ActionName: string;
  ActionParam: string[];
  ReactionId: string;
  ReactionName: string;
  ReactionParam: string[];
}

export class TokenDto {
  Token: string;
  RefreshToken: string;
}

export class DiseableDto {
  ServiceDiseable: string[];
}

export class PasswordDto {
  @ApiProperty({
    name: 'Password',
    description: 'New password of the user',
    type: 'string',
    example: 'area',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PictureDto {
  @ApiProperty({
    name: 'Password',
    description: 'New password of the user',
    type: 'string',
    example: 'area',
  })
  @IsString()
  @IsNotEmpty()
  picture: string;
}

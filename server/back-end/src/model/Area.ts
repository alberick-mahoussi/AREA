import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAreaState {
    @ApiProperty({
        name: 'User ID',
        description: 'ID of the user who want to update area',
        type: 'number',
        example: '1',
    })
    @IsNumber()
    @IsNotEmpty()
    IdUser: number

    @ApiProperty({
        name: 'Area ID',
        description: 'ID of the area who want to update',
        type: 'number',
        example: '2',
      })
      @IsNumber()
      @IsNotEmpty()
    IdArea: string;
}
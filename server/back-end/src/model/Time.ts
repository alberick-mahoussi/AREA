import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface GetTime {
    destination: string;
    subject: string;
    bodymail: string;
}
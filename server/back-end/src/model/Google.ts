import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface GoogleEmail {
    destination: string;
    subject: string;
    bodymail: string;
}

export interface NewEventCalendar {
    Summary: string;
    Description: string;
    Location: string;
    Starttime: string;
    End_Time: string;
}


export interface NewEventSpecifiedCalendar {
    calendarid: string;
    Summary: string;
    Description: string;
    Location: string;
    Starttime: string;
    End_Time: string;
}
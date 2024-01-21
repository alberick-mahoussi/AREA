import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConnectDbService } from './connect-db/connect-db.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AreaDto } from './auth/dto';


@Injectable()
export class AppService {
  constructor(private db: ConnectDbService,) {}

  getHello(): string {
    return 'Hello World!';
  }
}

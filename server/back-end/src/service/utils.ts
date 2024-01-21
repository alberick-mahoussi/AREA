import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Provider,
} from '@nestjs/common';
import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { ConnectDbService } from 'src/connect-db/connect-db.service';
import * as crypto from 'crypto';

@Injectable()
export class Utils {
  constructor(private db: ConnectDbService) {}
  static GetServiceAction(
    NameService: string,
    idAction: number,
  ): string | undefined {
    const filePath = join(__dirname, '..', '..', 'src/about/about.json');
    try {
      const aboutData = fs.readFileSync(filePath, 'utf-8');
      const jsonContent = JSON.parse(aboutData);
      const service = jsonContent.server.services.find(
        (s) => s.name === NameService,
      );
      const actionName: string | undefined = service[idAction].name;
      return actionName;
    } catch (err) {
      console.log({ error: 'Failed to retrieve about information' });
    }
  }
  generateRandomPassword(length: number = 12): string {
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericChars = '0123456789';
    const specialChars = '!@#$%^&*()-=_+[]{}|;:,.<>?';

    const allChars =
      lowerCaseChars + upperCaseChars + numericChars + specialChars;

    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(allChars.length);
      password += allChars.charAt(randomIndex);
    }

    return password;
  }
}

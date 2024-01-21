import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';

@ApiTags('About')
@Controller('about')
export class AboutController {
  /**
   * Method to list the available services, actions and reactions in the app  
   * @param res Json
   * @returns the About.json object whose contain the following service, areas available in application
   */
  @Get('json')
  @ApiOperation({summary: 'Method used to get Json data of service available'})
  @ApiResponse({status: 200, description: 'OK'})
  @ApiResponse({status: 400, description: 'Bad request'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  getAboutInfo(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', 'src/about/about.json');
    try {
      const aboutData = fs.readFileSync(filePath, 'utf-8');
      const jsonContent = JSON.parse(aboutData);
      return res.status(200).json(jsonContent);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve about information' });
    }
  }
}

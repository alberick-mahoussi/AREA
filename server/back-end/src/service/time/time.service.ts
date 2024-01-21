import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConnectDbService } from '../../connect-db/connect-db.service';
import { Area, Status } from "@prisma/client";

@Injectable()
export class TimeService {
  constructor(
    private readonly config: ConfigService,
    private db: ConnectDbService) {}

  async checkTimeAction(area: Area): Promise<string> {
    const apiUrl = `http://worldtimeapi.org/api/timezone/${area.ActionParam[0]}/${area.ActionParam[1]}`;
    const time_arg = area.ActionParam[2]

    try {
      const response = await axios.get(apiUrl);
      const dateTimeString = response.data.datetime;
      const [datePart, timePart] = dateTimeString.split('T');
      const [time, timeZone] = timePart.split(/[.+-]/);
      const [hour, minute, second] = time.split(':').map(Number);
      if (hour == parseInt(time_arg, 10)) {
        await this.db.area.update({
          where: {Id: area.Id},
          data: {
            state: Status.OFF,
          }
        });
        return "Reminder! It is now " + hour + "h" + minute + " in " + area.ActionParam[1];
      } else {
        return "";
      }
    } catch (error) {
      console.error('Error fetching time:', error);
    }
  }

  async addTimerService(id: number) {
    try {
      const user = await this.db.user.findUnique({
        where: { id: id },
      });

      const services = await this.db.service.findMany({
        where: { UserId: user.id },
      });

      if (!services.some(service => service.NameService === "Time")) {
        const Timeservice = await this.db.service.create({
          data: {
            NameService: 'Time',
            RequiresAuth: false,
            User: {
              connect: { id: user.id }
            },
            AvailableWebhook: false,
          }
        })
        const updatedUser = await this.db.user.update({
          where: { id: user.id },
          data: {
            services: {
              connect: { id: Timeservice.id },
            },
          },
        });
        console.log(`Service ${Timeservice.NameService} add `)
      }
    } catch (error) {
      console.error("Erreur de l'ahout du service Weather :", error);
    }
  }
}

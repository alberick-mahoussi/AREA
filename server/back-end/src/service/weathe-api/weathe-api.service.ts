import { Injectable, Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Area, Status } from "@prisma/client"
import { ApiTags } from '@nestjs/swagger';
import { ConnectDbService } from 'src/connect-db/connect-db.service';

@Injectable()
@ApiTags('Wearther Service')
@Controller('Weather')
export class WeatherService {
  constructor(
    private config: ConfigService,
    private db: ConnectDbService,
  ) { }

  async GetTemp(area: Area): Promise<string> {
    const city = area.ActionParam[0];
    const key = this.config.get('WEATHER_API_KEY');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const temp = parseFloat(response.data.main.temp) - 273.15;
      if (temp > 30 || temp < 5) {
        await this.db.area.update({
          where: {Id: area.Id},
          data: {
            state: Status.OFF,
          }
        });
      }
      if (temp > 30) {
        return "It is very hot today, it is " + Math.round(temp) + "°C!";
      } else if (temp < 5) {
        return "It is very cold today, it is " + Math.round(temp) + "°C!";
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching weather information:", error);
      const statusCode = error.response?.status || 500;
    }
  }

  async GetWeather(area: Area): Promise<string> {
    const city = area.ActionParam[0];
    const key = this.config.get('WEATHER_API_KEY');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const weather = response.data.weather.main
      if (weather === "Rain") {
        await this.db.area.update({
          where: {Id: area.Id},
          data: {
            state: Status.OFF,
          }
        });
        return "It is raining right now in " + city + ", don't forget your coat!";
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching weather information:", error);
      const statusCode = error.response?.status || 500;
    }
  }

  async addWeatherService(id: number) {

    try {
      const user = await this.db.user.findUnique({
        where: { id: id },
      });

      const services = await this.db.service.findMany({
        where: { UserId: user.id },
      });

      if (!services.some(service => service.NameService === "Weather")) {
        const weatherservice = await this.db.service.create({
          data: {
            NameService: 'Weather',
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
              connect: { id: weatherservice.id },
            },
          },
        });
        console.log(`Service ${weatherservice.NameService} add `)
      }
    } catch (error) {
      console.error("Erreur de l'ahout du service Weather :", error);
    }
  }
}

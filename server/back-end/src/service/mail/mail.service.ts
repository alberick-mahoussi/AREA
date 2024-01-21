import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Area, Status } from "@prisma/client";
import { ConnectDbService } from '../../connect-db/connect-db.service';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
    private db: ConnectDbService) {}

   async sendEmail(mailContents: string, area: Area): Promise<void> {
    const mail = area.ReactionParam[0];
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
        user: this.config.get('TASKTIE_MAIL'),
        pass: this.config.get('TASKTIE_PWD'),
      },
    });
    const mailOptions = {
      from: this.config.get('TASKTIE_MAIL'),
      to: mail,
      subject: 'Tasktie bot information!',
      text: `${mailContents}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  async sendEmailNewUser(password:string, user:string, usermail:string): Promise<void> {
    const mailContents: string = `Nous sommes ravis de vous accueillir sur AREA TASKTIE ! Votre compte a été créé avec succès.\n
    Informations du compte :\n
    Nom d'utilisateur : ${user}\n
    Adresse e-mail associée : ${usermail}\n
    Password: ${password}`
    const mail = usermail
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
        user: this.config.get('TASKTIE_MAIL'),
        pass: this.config.get('TASKTIE_PWD'),
      },
    });
    const mailOptions = {
      from: this.config.get('TASKTIE_MAIL'),
      to: mail,
      subject: 'Tasktie Account Information!',
      text: `${mailContents}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
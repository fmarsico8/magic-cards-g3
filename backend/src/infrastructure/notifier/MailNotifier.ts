import nodemailer from 'nodemailer';
import { INotifier } from '../../domain/interfaces/INotifier';

export class MailNotifier implements INotifier {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async send(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: body,
    });
  }
}

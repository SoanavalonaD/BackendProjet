import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // async sendAssignmentMail(to: string, task: any) {
  //   const info = await this.transporter.sendMail({
  //     from: process.env.SMTP_FROM || 'no-reply@example.com',
  //     to,
  //     subject: `Nouvelle tâche assignée: ${task.title}`,
  //     text: `Une nouvelle tâche vous a été assignée : ${task.title}\n\n${task.description || ''}`,
  //     html: `<p>Une nouvelle tâche vous a été assignée : <b>${task.title}</b></p><p>${task.description || ''}</p>`,
  //   });
  //   return info;
  // }

  async sendAssignmentMail(to: string, task: any) {
    console.log(`✉️ Preparing to send mail to ${to} for task "${task.title}"`);
    const info = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to,
      subject: `Nouvelle tâche assignée: ${task.title}`,
      text: `Une nouvelle tâche vous a été assignée : ${task.title}\n\n${task.description || ''}`,
      html: `<p>Une nouvelle tâche vous a été assignée : <b>${task.title}</b></p><p>${task.description || ''}</p>`,
    });
    console.log('✉️ Mail sent info:', info.messageId);
    return info;
  }


}
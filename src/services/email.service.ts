import nodemailer from 'nodemailer';
import { config } from '../utils/config.ts';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendRegistrationConfirmation(to: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Welcome to FocusBoard!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been successfully created.</p>
      <p>You can now log in and start using FocusBoard.</p>
    `,
  });
}

import { NewsletterDB } from './newsletter-db';
import { getSiteUrl } from '@/config/site';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY || '';
    this.domain = process.env.MAILGUN_DOMAIN || '';
    this.baseUrl = `https://api.mailgun.net/v3/${this.domain}`;

    if (!this.apiKey || !this.domain) {
      console.warn('Mailgun credentials not configured. Email notifications will be disabled.');
    }
  }

  private async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.apiKey || !this.domain) {
      console.warn('Mailgun not configured, skipping email send');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('from', `0xJerry's Lab <noreply@${this.domain}>`);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.html);
      if (emailData.text) {
        formData.append('text', emailData.text);
      }

      // Build Basic auth header in a Node-safe way
      const basicAuth = typeof btoa === 'function'
        ? btoa(`api:${this.apiKey}`)
        : Buffer.from(`api:${this.apiKey}`).toString('base64');

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Mailgun API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully:', result.id);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const siteUrl = getSiteUrl();
    const subject = 'Welcome to 0xJerry\'s Lab Newsletter!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to 0xJerry's Lab!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for subscribing to our newsletter. You're now part of an exclusive community of cybersecurity enthusiasts who stay ahead of the curve.</p>

              <p>What you can expect:</p>
              <ul>
                <li>🛡️ Latest cybersecurity insights and trends</li>
                <li>💻 Detailed HTB machine writeups</li>
                <li>🛠️ New tools and techniques</li>
                <li>🎯 Exclusive content and early access</li>
              </ul>

              <p>Stay curious, keep learning, and welcome to the community!</p>

              <a href="${siteUrl}" class="button">Visit 0xJerry's Lab</a>

              <p>If you have any questions, feel free to reply to this email.</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to our newsletter.</p>
              <p>© 2025 0xJerry's Lab | Built in the shadows, compiled with curiosity.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendNewMachineNotification(machineName: string, machineOs: string, machineDifficulty: string): Promise<void> {
    const newsletterDB = new NewsletterDB();
    const subscribers = await newsletterDB.getAllSubscribers();

    if (subscribers.length === 0) {
      console.log('No subscribers to notify about new machine');
      return;
    }

    const siteUrl = getSiteUrl();
    const subject = `🚀 New ${machineDifficulty} Machine: ${machineName}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .machine-card { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .difficulty { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
            .easy { background: #4CAF50; }
            .medium { background: #FF9800; }
            .hard { background: #F44336; }
            .insane { background: #9C27B0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 New Machine Alert!</h1>
            </div>
            <div class="content">
              <p>A new machine has been added to our collection!</p>

              <div class="machine-card">
                <h2 style="margin-top: 0; color: #667eea;">${machineName}</h2>
                <p><strong>OS:</strong> ${machineOs}</p>
                <span class="difficulty ${machineDifficulty.toLowerCase()}">${machineDifficulty}</span>
              </div>

              <p>Ready to test your skills? Head over to our machines section and give it a try!</p>

              <a href="${siteUrl}/machines" class="button">View All Machines</a>

              <p>Happy hacking! 🛡️</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to our newsletter.</p>
              <p>© 2025 0xJerry's Lab | Built in the shadows, compiled with curiosity.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to all subscribers in small batches to avoid provider limits
    const batchSize = 50;
    let totalSuccess = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      try {
        const results = await Promise.allSettled(
          batch.map(subscriber => this.sendEmail({ to: subscriber.email, subject, html }))
        );
        const successful = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<boolean>).value).length;
        totalSuccess += successful;
        console.log(`Email batch ${Math.floor(i / batchSize) + 1}: ${successful}/${batch.length} sent`);
      } catch (error) {
        console.error('Error sending a notification batch:', error);
      }
    }

    console.log(`Sent new machine notification to ${totalSuccess}/${subscribers.length} subscribers`);
  }
}

export const emailService = new EmailService();

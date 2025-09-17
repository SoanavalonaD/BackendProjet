import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { NotificationsGateway } from './notifications.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private conn: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchange = process.env.RMQ_EXCHANGE || 'tasks.exchange';
  private readonly queue = process.env.RMQ_QUEUE || 'notifications.queue';

  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

    let connected = false;
    let retries = 10;

    while (!connected && retries > 0) {
      try {
        this.conn = await amqp.connect(url);
        this.channel = await this.conn.createChannel();

        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        await this.channel.assertQueue(this.queue, { durable: true });
        await this.channel.bindQueue(this.queue, this.exchange, 'task.*');

        await this.channel.consume(
          this.queue,
          async (msg) => {
            if (!msg) return;
            try {
              const content = JSON.parse(msg.content.toString());

              if (content.type === 'task.assigned' || content.type === 'task.updated') {
                const { task } = content;

                console.log(`📬 Notification received: ${content.type} -> ${task.title}`);

                // Mail
                await this.mailService
                  .sendAssignmentMail(task.assigneeEmail, task)
                  .then(() =>
                    console.log(`✅ Mail sent to ${task.assigneeEmail} for task "${task.title}"`)
                  )
                  .catch((err) => console.error('Mailer error:', err));

                // WebSocket
                this.gateway.emitNotification({ event: content.type, task });
                console.log(`🔔 WS emitted for task "${task.title}"`);
              }

              this.channel.ack(msg);
            } catch (err) {
              console.error('Processing error:', err);
              this.channel.nack(msg, false, false);
            }
          },
          { noAck: false },
        );

        connected = true;
        console.log('✅ Notifications consumer started and connected to RabbitMQ');
      } catch (err) {
        retries--;
        console.log(
          `⏳ RabbitMQ not ready, retrying in 5s... (${retries} retries left)`,
        );
        await new Promise((res) => setTimeout(res, 5000));
      }
    }

    if (!connected) {
      throw new Error('❌ Could not connect consumer to RabbitMQ after multiple retries');
    }
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch (e) {}
    try { await this.conn?.close(); } catch (e) {}
  }
}

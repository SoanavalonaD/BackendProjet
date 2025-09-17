import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private conn: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchange = process.env.RMQ_EXCHANGE || 'tasks.exchange';

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    let connected = false;
    let retries = 10;

    while (!connected && retries > 0) {
      try {
        this.conn = await amqp.connect(url);
        this.channel = await this.conn.createConfirmChannel();
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        connected = true;
        console.log('✅ Connected to RabbitMQ (publisher)');
      } catch (err) {
        retries--;
        console.log(`⏳ RabbitMQ not ready, retrying in 5s... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 5000));
      }
    }

    if (!connected) throw new Error('❌ Could not connect to RabbitMQ');
  }

  async publish(routingKey: string, payload: object) {
    const buf = Buffer.from(JSON.stringify(payload));
    return new Promise<void>((resolve, reject) => {
      this.channel.publish(this.exchange, routingKey, buf, { persistent: true }, (err, ok) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch {}
    try { await this.conn?.close(); } catch {}
  }
}

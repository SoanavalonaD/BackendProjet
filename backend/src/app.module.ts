import { Module } from '@nestjs/common';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { NotificationsConsumer } from './notifications/notifications.consumer';
import { MailService } from './mail/mail.service';

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [
    RabbitmqService,
    TasksService,
    NotificationsGateway,
    MailService,
    NotificationsConsumer,
  ],
})
export class AppModule {}
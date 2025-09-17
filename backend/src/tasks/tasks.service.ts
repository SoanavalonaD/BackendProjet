import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TasksService {
  constructor(private readonly rmq: RabbitmqService) {}

  async createAndPublish(dto: CreateTaskDto) {
    const task = {
      id: uuid(),
      title: dto.title,
      description: dto.description || null,
      assigneeEmail: dto.assigneeEmail,
      assigneeId: dto.assigneeId || null,
      assignedAt: new Date().toISOString(),
    };
    await this.rmq.publish('task.assigned', { type: 'task.assigned', task });
    return task;
  }
}
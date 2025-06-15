import { INotifier } from '../../domain/interfaces/INotifier';
import { sendToQueue } from '../queue/RabbitMQConnection';

export class QueueNotifier implements INotifier {
  async send(to: string, subject: string, body: string): Promise<void> {
    await sendToQueue({ to, subject, body });
  }
}

import { INotifier } from '../../domain/interfaces/INotifier';

export class NotifierService {
  constructor(private readonly notifier: INotifier) {}

  async notify(to: string, subject: string, body: string): Promise<void> {
    await this.notifier.send(to, subject, body);
  }
}

import { INotifier } from '../../domain/interfaces/INotifier';

export class NotifierService {
  constructor(private readonly notifier: INotifier) {}

  async notify(to: string, subject: string, body: string): Promise<void> {
    await this.notifier.send(to, subject, body);
  }

  async welcomeNotify(to: string): Promise<void> {
    await this.notifier.send(
      to,
      'Welcome to the platform',
      'Thank you for registering at DeckTrade. We hope you enjoy our platform.'
    );
  }

  async acceptOfferNotify(to: string, publicationName: string): Promise<void> {
    await this.notifier.send(
      to,
      'Your offer was accepted!',
      `Good news! Your offer for the publication "${publicationName}" has been accepted. Please check the platform to confirm the next steps.`
    );
  }

  async rejectOfferNotify(to: string, publicationName: string): Promise<void> {
    await this.notifier.send(
      to,
      'Your offer was rejected',
      `Unfortunately, your offer for the publication "${publicationName}" was rejected. Don't worry, you can keep exploring other opportunities on DeckTrade.`
    );
  }
  async publicationAcceptedNotify(to: string, publicationName: string): Promise<void> {
    await this.notifier.send(
      to,
      'Your publication was accepted!',
      `Congratulations! Your publication "${publicationName}" has been accepted. Please check the platform to confirm the next steps.`
    );
  }
}

export interface INotifier {
    send(to: string, subject: string, body: string): Promise<void>;
  }
  
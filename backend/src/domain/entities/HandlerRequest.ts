import { Request, Response } from 'express';
import { HttpException } from './exceptions/HttpException';

export class HandlerRequest {
  public static async handle<T>(
    req: Request,
    res: Response,
    logic: () => Promise<T>,
    successStatus: number,
    sendJson: boolean
  ): Promise<void> {
    try {
      const result = await logic();
    
      if (!successStatus) {
        successStatus = 200;
      }

      if (!sendJson) {
        sendJson = true;
      }

      if (sendJson) {
        res.status(successStatus).json(result);
      } else {
        res.status(successStatus).send();
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

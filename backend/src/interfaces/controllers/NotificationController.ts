import { Request, Response } from "express";
import { NotificationService } from "../../application/services/NotificationService";
import { CreateNotificationDTO, NotificationFilterDTO, UpdateNotificationDTO } from "../../application/dtos/NotificationDTO";
import { PaginationDTO } from "../../application/dtos/PaginationDTO";
import { Validations } from "../../infrastructure/utils/Validations";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  public async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData: CreateNotificationDTO = req.body;
      Validations.requiredField(notificationData.userId, 'userId');
      Validations.requiredField(notificationData.message, 'message');
      Validations.requiredField(notificationData.offerId, 'offerId');
      Validations.requiredField(notificationData.type, 'type');
      
      const notification = await this.notificationService.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async getNotificationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Validations.validateId(id, 'id');
      
      const notification = await this.notificationService.getNotificationById(id);
      res.status(200).json(notification);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Notification not found' });
    }
  }

  public async getNotificationsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      Validations.validateId(userId, 'userId');
      
      const notifications = await this.notificationService.getNotificationsByUserId(userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const filters: NotificationFilterDTO = req.query as any;
      const notifications = await this.notificationService.getNotifications(filters);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async getNotificationsPaginated(req: Request, res: Response): Promise<void> {
    try {
      const { offset = 0, limit = 10, ...filters } = req.query;
      const paginationData: PaginationDTO<NotificationFilterDTO> = {
        data: filters as NotificationFilterDTO,
        offset: Number(offset),
        limit: Number(limit)
      };
      
      const result = await this.notificationService.getNotificationsPaginated(paginationData);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async updateNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateNotificationDTO = req.body;
      Validations.validateId(id, 'id');
      
      const notification = await this.notificationService.updateNotification(id, updateData);
      res.status(200).json(notification);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async markNotificationAsSeen(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Validations.validateId(id, 'id');
      
      const notification = await this.notificationService.markNotificationAsSeen(id);
      res.status(200).json(notification);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async markAllNotificationsAsSeen(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      Validations.validateId(userId, 'userId');
      
      await this.notificationService.markAllNotificationsAsSeen(userId);
      res.status(200).json({ message: 'All notifications marked as seen' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  public async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      Validations.validateId(id, 'id');
      
      const deleted = await this.notificationService.deleteNotification(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Special endpoint to get notifications and mark them as seen when accessed
  public async getNotificationsAndMarkAsSeen(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      Validations.validateId(userId, 'userId');
      
      // Get notifications first
      const notifications = await this.notificationService.getNotificationsByUserId(userId);
      
      // Mark all as seen
      await this.notificationService.markAllNotificationsAsSeen(userId);
      
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

import { Notifications, NotificationType } from "../../domain/entities/Notifications";
import { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { CreateNotificationDTO, NotificationFilterDTO, NotificationResponseDTO, UpdateNotificationDTO } from "../dtos/NotificationDTO";
import { PaginatedResponseDTO, PaginationDTO } from "../dtos/PaginationDTO";
import { Validations } from "../../infrastructure/utils/Validations";

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  public async createNotification(notificationData: CreateNotificationDTO): Promise<NotificationResponseDTO> {
    const notification = new Notifications({
      userId: notificationData.userId,
      message: notificationData.message,
      offerId: notificationData.offerId,
      type: notificationData.type
    });

    const savedNotification = await this.notificationRepository.save(notification);
    return this.toNotificationResponseDTO(savedNotification);
  }

  public async createOfferCreatedNotification(offerId: string, publicationOwnerId: string, offerOwnerName: string): Promise<NotificationResponseDTO> {
    const message = `${offerOwnerName} has made an offer on your publication`;
    return this.createNotification({
      userId: publicationOwnerId,
      message,
      offerId,
      type: NotificationType.OFFER_CREATED
    });
  }

  public async createOfferAcceptedNotification(offerId: string, offerOwnerId: string, publicationOwnerName: string): Promise<NotificationResponseDTO> {
    const message = `${publicationOwnerName} has accepted your offer`;
    return this.createNotification({
      userId: offerOwnerId,
      message,
      offerId,
      type: NotificationType.OFFER_ACCEPTED
    });
  }

  public async createOfferRejectedNotification(offerId: string, offerOwnerId: string, publicationOwnerName: string): Promise<NotificationResponseDTO> {
    const message = `${publicationOwnerName} has rejected your offer`;
    return this.createNotification({
      userId: offerOwnerId,
      message,
      offerId,
      type: NotificationType.OFFER_REJECTED
    });
  }

  public async getNotificationById(id: string): Promise<NotificationResponseDTO> {
    const notification = await this.notificationRepository.findById(id);
    const foundNotification = Validations.ensureFound(notification, 'Notification');
    return this.toNotificationResponseDTO(foundNotification);
  }

  public async getNotificationsByUserId(userId: string): Promise<NotificationResponseDTO[]> {
    const notifications = await this.notificationRepository.findByUserId(userId);
    return notifications.map(this.toNotificationResponseDTO);
  }

  public async getNotifications(filters: NotificationFilterDTO): Promise<NotificationResponseDTO[]> {
    const notifications = await this.notificationRepository.find(filters);
    return notifications.map(this.toNotificationResponseDTO);
  }

  public async getNotificationsPaginated(filters: PaginationDTO<NotificationFilterDTO>): Promise<PaginatedResponseDTO<NotificationResponseDTO>> {
    const result = await this.notificationRepository.findPaginated(filters);
    return {
      ...result,
      data: result.data.map(this.toNotificationResponseDTO)
    };
  }

  public async updateNotification(id: string, updateData: UpdateNotificationDTO): Promise<NotificationResponseDTO> {
    let notification = await this.notificationRepository.findById(id);
    notification = Validations.ensureFound(notification, 'Notification');

    if (updateData.seen !== undefined) {
      notification.setSeen(updateData.seen);
    }

    const updatedNotification = await this.notificationRepository.update(notification);
    return this.toNotificationResponseDTO(updatedNotification);
  }

  public async markNotificationAsSeen(id: string): Promise<NotificationResponseDTO> {
    let notification = await this.notificationRepository.findById(id);
    notification = Validations.ensureFound(notification, 'Notification');

    notification.markAsSeen();
    const updatedNotification = await this.notificationRepository.update(notification);
    return this.toNotificationResponseDTO(updatedNotification);
  }

  public async markAllNotificationsAsSeen(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsSeen(userId);
  }

  public async deleteNotification(id: string): Promise<boolean> {
    return await this.notificationRepository.delete(id);
  }

  private toNotificationResponseDTO(notification: Notifications): NotificationResponseDTO {
    return {
      id: notification.getId(),
      userId: notification.getUserId(),
      message: notification.getMessage(),
      offerId: notification.getOfferId(),
      type: notification.getType(),
      seen: notification.getSeen(),
      createdAt: notification.getCreatedAt(),
      updatedAt: notification.getUpdatedAt()
    };
  }
} 
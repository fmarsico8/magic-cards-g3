import { NotificationType } from "../../domain/entities/Notifications";

export interface CreateNotificationDTO {
  userId: string;
  message: string;
  offerId: string;
  type: NotificationType;
}

export interface UpdateNotificationDTO {
  id: string;
  seen?: boolean;
}

export interface NotificationResponseDTO {
  id: string;
  userId: string;
  message: string;
  offerId: string;
  type: NotificationType;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilterDTO {
  userId?: string;
  seen?: boolean;
  type?: NotificationType;
}

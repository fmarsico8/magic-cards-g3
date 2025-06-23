import { Notifications, NotificationType } from "../../../../domain/entities/Notifications";
import { INotification } from "../models/NotificationModel";
import { Types } from "mongoose";

export const NotificationMapper = {
  toDocument(notification: Notifications): Partial<INotification> {
    return {
      _id: new Types.ObjectId(notification.getId()),
      userId: new Types.ObjectId(notification.getUserId()),
      message: notification.getMessage(),
      offerId: new Types.ObjectId(notification.getOfferId()),
      type: notification.getType(),
      seen: notification.getSeen(),
      createdAt: notification.getCreatedAt(),
      updatedAt: notification.getUpdatedAt()
    };
  },

  toEntity(doc: INotification): Notifications {
    return new Notifications({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      message: doc.message,
      offerId: doc.offerId.toString(),
      type: doc.type,
      seen: doc.seen,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}; 
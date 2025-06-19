import { SchemaFactory } from './SchemaFactory';
import { BaseModel, IBaseDocument } from './BaseModel';
import { NotificationType } from '../../../../domain/entities/Notifications';
import { Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface INotification extends IBaseDocument {
  userId: Types.ObjectId;
  message: string;
  offerId: Types.ObjectId;
  type: NotificationType;
  seen: boolean;
}

const notificationSchema = SchemaFactory.createBaseSchema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  offerId: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  seen: { type: Boolean, default: false }
});

const NotificationModelClass = SchemaFactory.createModel<INotification>('Notification', notificationSchema);

export class NotificationModel extends BaseModel<INotification> {
  constructor() {
    super(NotificationModelClass);
  }
   
  async findByUserId(userId: string): Promise<INotification[]> {
    return this.model.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async markAllAsSeen(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId: new Types.ObjectId(userId), seen: false },
      { seen: true }
    ).exec();
  }
} 
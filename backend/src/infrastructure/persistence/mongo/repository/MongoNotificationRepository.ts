import { NotificationRepository } from "../../../../domain/repositories/NotificationRepository";
import { Notifications } from "../../../../domain/entities/Notifications";
import { NotificationModel } from "../models/NotificationModel";
import { NotificationMapper } from "../mappers/notification.mapper";
import { NotificationFilterDTO } from "@/application/dtos/NotificationDTO";
import { PaginatedResponseDTO, PaginationDTO } from "@/application/dtos/PaginationDTO";
import { Types } from "mongoose";

export class MongoNotificationRepository implements NotificationRepository {
  private notificationModel: NotificationModel;

  constructor() {
    this.notificationModel = new NotificationModel();
  }

  async save(notification: Notifications): Promise<Notifications> {
    const doc = await this.notificationModel.create(NotificationMapper.toDocument(notification));
    return NotificationMapper.toEntity(doc);
  }

  async update(notification: Notifications): Promise<Notifications> {
    const doc = await this.notificationModel.update(notification.getId(), NotificationMapper.toDocument(notification));
    if (!doc) throw new Error("Notification not found");
    return NotificationMapper.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.notificationModel.delete(id);
    return result !== null;
  }

  async findById(id: string): Promise<Notifications | null> {
    const doc = await this.notificationModel.findById(id);
    return doc ? NotificationMapper.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Notifications[]> {
    const docs = await this.notificationModel.findByUserId(userId);
    return docs.map(NotificationMapper.toEntity);
  }

  async find(filters: NotificationFilterDTO): Promise<Notifications[]> {
    const filter: any = {};
    
    if (filters.userId) {
      filter.userId = new Types.ObjectId(filters.userId);
    }
    
    if (filters.seen !== undefined) {
      filter.seen = filters.seen;
    }
    
    if (filters.type) {
      filter.type = filters.type;
    }

    const docs = await this.notificationModel.findByFilter(filter);
    return docs.map(NotificationMapper.toEntity);
  }

  async findPaginated(filters: PaginationDTO<NotificationFilterDTO>): Promise<PaginatedResponseDTO<Notifications>> {
    const filter: any = {};
    
    if (filters.data?.userId) {
      filter.userId = new Types.ObjectId(filters.data.userId);
    }
    
    if (filters.data?.seen !== undefined) {
      filter.seen = filters.data.seen;
    }
    
    if (filters.data?.type) {
      filter.type = filters.data.type;
    }

    const result = await this.notificationModel.findPaginatedWithFilters(
      filter,
      filters.offset || 0,
      filters.limit || 10
    );

    return {
      data: result.docs.map(NotificationMapper.toEntity),
      total: result.total,
      offset: filters.offset || 0,
      limit: filters.limit || 10,
      hasMore: (filters.offset || 0) + (filters.limit || 10) < result.total
    };
  }

  async markAllAsSeen(userId: string): Promise<void> {
    await this.notificationModel.markAllAsSeen(userId);
  }
} 
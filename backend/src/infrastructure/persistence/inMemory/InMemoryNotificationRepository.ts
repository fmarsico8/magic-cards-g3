import { Notifications } from '../../../domain/entities/Notifications';
import { NotificationRepository } from '../../../domain/repositories/NotificationRepository';
import { NotificationFilterDTO } from '@/application/dtos/NotificationDTO';
import { PaginatedResponseDTO, PaginationDTO } from '@/application/dtos/PaginationDTO';

export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notifications> = new Map();

  async save(notification: Notifications): Promise<Notifications> {
    this.notifications.set(notification.getId(), notification);
    return notification;
  }

  async update(notification: Notifications): Promise<Notifications> {
    if (!this.notifications.has(notification.getId())) {
      throw new Error('Notification not found');
    }
    this.notifications.set(notification.getId(), notification);
    return notification;
  }

  async delete(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async findById(id: string): Promise<Notifications | null> {
    return this.notifications.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Notifications[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.getUserId() === userId);
  }

  async find(filters: NotificationFilterDTO): Promise<Notifications[]> {
    let filteredNotifications = Array.from(this.notifications.values());

    if (filters.userId) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.getUserId() === filters.userId
      );
    }

    if (filters.seen !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.getSeen() === filters.seen
      );
    }

    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.getType() === filters.type
      );
    }

    return filteredNotifications;
  }

  async findPaginated(filters: PaginationDTO<NotificationFilterDTO>): Promise<PaginatedResponseDTO<Notifications>> {
    const filteredNotifications = await this.find(filters.data || {});
    const total = filteredNotifications.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    
    const paginatedData = filteredNotifications.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    };
  }

  async markAllAsSeen(userId: string): Promise<void> {
    const userNotifications = await this.findByUserId(userId);
    userNotifications.forEach(notification => {
      notification.setSeen(true);
      this.notifications.set(notification.getId(), notification);
    });
  }
} 
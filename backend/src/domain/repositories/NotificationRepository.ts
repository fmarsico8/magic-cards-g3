import { Notifications } from "../entities/Notifications";
import { NotificationFilterDTO } from "@/application/dtos/NotificationDTO";
import { PaginatedResponseDTO, PaginationDTO } from "@/application/dtos/PaginationDTO";

export interface NotificationRepository {
  save(notification: Notifications): Promise<Notifications>;
  update(notification: Notifications): Promise<Notifications>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Notifications | null>;
  findByUserId(userId: string): Promise<Notifications[]>;
  find(filters: NotificationFilterDTO): Promise<Notifications[]>;
  findPaginated(filters: PaginationDTO<NotificationFilterDTO>): Promise<PaginatedResponseDTO<Notifications>>;
  markAllAsSeen(userId: string): Promise<void>;
} 
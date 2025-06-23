import { api } from "@/lib/api-client"
import type { 
  CreateNotificationDTO, 
  NotificationResponseDTO, 
  UpdateNotificationDTO, 
  NotificationFilterDTO 
} from "@/types/notification"
import type { PaginatedResponseDTO, PaginationDTO } from "@/types/pagination"

export const notificationService = {
  
  // Get notifications with filters and pagination
  getNotifications: async (filters: PaginationDTO<NotificationFilterDTO> = { data: {} }) => {
    const queryParams = new URLSearchParams()

    if (filters.data.userId) queryParams.append("userId", filters.data.userId)
    if (filters.data.seen !== undefined) queryParams.append("seen", filters.data.seen.toString())
    if (filters.data.type) queryParams.append("type", filters.data.type)
    if (filters.data.offerId) queryParams.append("offerId", filters.data.offerId)
    if (filters.limit !== undefined) queryParams.append("limit", filters.limit.toString())
    if (filters.offset !== undefined) queryParams.append("offset", filters.offset.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/notifications?${queryString}` : "/notifications"

    return api.get<PaginatedResponseDTO<NotificationResponseDTO>>(endpoint)
  },

  // Get single notification by ID
  getNotificationById: async (notificationId: string) => {
    return api.get<NotificationResponseDTO>(`/notifications/${notificationId}`)
  },

  // Get all notifications for a specific user
  getNotificationsByUserId: async (userId: string) => {
    return api.get<NotificationResponseDTO[]>(`/notifications/user/${userId}`)
  },

  // Get notifications for user and mark them as seen (special endpoint)
  getNotificationsAndMarkAsSeen: async (userId: string) => {
    return api.get<NotificationResponseDTO[]>(`/notifications/user/${userId}/mark-seen`)
  },

  // Create a new notification (usually used for testing or admin purposes)
  createNotification: async (notificationData: CreateNotificationDTO) => {
    return api.post<NotificationResponseDTO>("/notifications", notificationData)
  },

  // Update notification (mainly for seen status)
  updateNotification: async (notificationId: string, updateData: UpdateNotificationDTO) => {
    return api.put<NotificationResponseDTO>(`/notifications/${notificationId}`, updateData)
  },

  // Mark specific notification as seen
  markNotificationAsSeen: async (notificationId: string) => {
    return api.patch<NotificationResponseDTO>(`/notifications/${notificationId}/seen`)
  },

  // Mark all notifications as seen for a user
  markAllNotificationsAsSeen: async (userId: string) => {
    return api.patch<{ message: string }>(`/notifications/user/${userId}/seen`)
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    return api.delete(`/notifications/${notificationId}`)
  },

  // Get paginated notifications (alternative method for better performance)
  getNotificationsPaginated: async (filters: PaginationDTO<NotificationFilterDTO>) => {
    const queryParams = new URLSearchParams()

    // Add filter data
    if (filters.data.userId) queryParams.append("userId", filters.data.userId)
    if (filters.data.seen !== undefined) queryParams.append("seen", filters.data.seen.toString())
    if (filters.data.type) queryParams.append("type", filters.data.type)
    if (filters.data.offerId) queryParams.append("offerId", filters.data.offerId)
    
    // Add pagination params
    if (filters.limit !== undefined) queryParams.append("limit", filters.limit.toString())
    if (filters.offset !== undefined) queryParams.append("offset", filters.offset.toString())

    const queryString = queryParams.toString()
    const endpoint = `/notifications/paginated${queryString ? `?${queryString}` : ""}`

    return api.get<PaginatedResponseDTO<NotificationResponseDTO>>(endpoint)
  }
}
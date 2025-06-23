export interface NotificationResponseDTO {
    id: string
    userId: string
    message: string
    offerId: string
    type: NotificationType
    seen: boolean
    createdAt: string
    updatedAt: string
  }
  
  export interface CreateNotificationDTO {
    userId: string
    message: string
    offerId: string
    type: NotificationType
    seen?: boolean
  }
  
  export interface UpdateNotificationDTO {
    id: string
    seen?: boolean
  }
  
  export interface NotificationFilterDTO {
    userId?: string
    seen?: boolean
    type?: NotificationType
    offerId?: string
  }
  
  export enum NotificationType {
    OFFER_CREATED = "offer_created",
    OFFER_ACCEPTED = "offer_accepted", 
    OFFER_REJECTED = "offer_rejected"
  }
  
  
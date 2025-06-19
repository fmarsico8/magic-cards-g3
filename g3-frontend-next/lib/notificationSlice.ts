import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type NotificationFilterDTO, type NotificationResponseDTO, type CreateNotificationDTO, type UpdateNotificationDTO, NotificationType } from "@/types/notification"
import type { PaginatedResponseDTO, PaginationDTO } from "@/types/pagination"
import { notificationService } from "@/services/notifications-service"
import Promise from "bluebird"

interface NotificationsState {
  notifications: NotificationResponseDTO[]
  selectedNotification: NotificationResponseDTO | null
  unreadCount: number
  isLoading: boolean
  error: string | null
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
}

const initialState: NotificationsState = {
  notifications: [],
  selectedNotification: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    offset: 0,
    limit: 10,
    hasMore: false,
  },
}

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchNotificationsSuccess: (
      state,
      action: PayloadAction<{ data: NotificationResponseDTO[]; pagination: Omit<PaginatedResponseDTO<any>, "data">; append: boolean }>
    ) => {
      const { data, pagination, append } = action.payload
      state.notifications = append ? [...state.notifications, ...data] : data
      state.unreadCount = data.filter(n => !n.seen).length
      state.pagination = {
        total: pagination.total,
        offset: pagination.offset,
        limit: pagination.limit,
        hasMore: pagination.hasMore,
      }
      state.isLoading = false
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Fetch notification by ID
    fetchNotificationByIdStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchNotificationByIdSuccess: (state, action: PayloadAction<NotificationResponseDTO>) => {
      state.selectedNotification = action.payload
      state.isLoading = false
    },
    fetchNotificationByIdFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Fetch user notifications
    fetchUserNotificationsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchUserNotificationsSuccess: (state, action: PayloadAction<NotificationResponseDTO[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.seen).length
      state.isLoading = false
    },
    fetchUserNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Create notification
    createNotificationStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createNotificationSuccess: (state, action: PayloadAction<NotificationResponseDTO>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.seen) {
        state.unreadCount += 1
      }
      state.isLoading = false
    },
    createNotificationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Update notification
    updateNotificationStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateNotificationSuccess: (state, action: PayloadAction<NotificationResponseDTO>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].seen
        state.notifications[index] = action.payload
        if (wasUnread && action.payload.seen) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
      if (state.selectedNotification?.id === action.payload.id) {
        state.selectedNotification = action.payload
      }
      state.isLoading = false
    },
    updateNotificationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Mark notification as seen
    markNotificationAsSeenStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    markNotificationAsSeenSuccess: (state, action: PayloadAction<NotificationResponseDTO>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1 && !state.notifications[index].seen) {
        state.notifications[index] = action.payload
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      if (state.selectedNotification?.id === action.payload.id) {
        state.selectedNotification = action.payload
      }
      state.isLoading = false
    },
    markNotificationAsSeenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Mark all notifications as seen
    markAllNotificationsAsSeenStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    markAllNotificationsAsSeenSuccess: (state) => {
      state.notifications.forEach(notification => {
        notification.seen = true
      })
      state.unreadCount = 0
      state.isLoading = false
    },
    markAllNotificationsAsSeenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Delete notification
    deleteNotificationStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteNotificationSuccess: (state, action: PayloadAction<string>) => {
      const notificationToDelete = state.notifications.find(n => n.id === action.payload)
      if (notificationToDelete && !notificationToDelete.seen) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
      if (state.selectedNotification?.id === action.payload) {
        state.selectedNotification = null
      }
      state.isLoading = false
    },
    deleteNotificationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = []
      state.selectedNotification = null
      state.unreadCount = 0
      state.pagination = {
        total: 0,
        offset: 0,
        limit: 10,
        hasMore: false,
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Mark as seen locally (optimistic update)
    markAsSeenLocally: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload
      const notification = state.notifications.find(n => n.id === notificationId)
      if (notification && !notification.seen) {
        notification.seen = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      if (state.selectedNotification?.id === notificationId) {
        state.selectedNotification.seen = true
      }
    },

    // Mark all as seen locally (optimistic update)
    markAllAsSeenLocally: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      state.notifications.forEach(notification => {
        if (notification.userId === userId && !notification.seen) {
          notification.seen = true
        }
      })
      state.unreadCount = 0
    }
  },
})

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  fetchNotificationByIdStart,
  fetchNotificationByIdSuccess,
  fetchNotificationByIdFailure,
  fetchUserNotificationsStart,
  fetchUserNotificationsSuccess,
  fetchUserNotificationsFailure,
  createNotificationStart,
  createNotificationSuccess,
  createNotificationFailure,
  updateNotificationStart,
  updateNotificationSuccess,
  updateNotificationFailure,
  markNotificationAsSeenStart,
  markNotificationAsSeenSuccess,
  markNotificationAsSeenFailure,
  markAllNotificationsAsSeenStart,
  markAllNotificationsAsSeenSuccess,
  markAllNotificationsAsSeenFailure,
  deleteNotificationStart,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  clearNotifications,
  clearError,
  markAsSeenLocally,
  markAllAsSeenLocally,
} = notificationsSlice.actions

export default notificationsSlice.reducer

// Thunk dispatchers following the pattern from offersSlice

export const fetchNotifications = (
  filters: PaginationDTO<NotificationFilterDTO> = { data: {} },
  append = false
) => async (dispatch: any) => {
  dispatch(fetchNotificationsStart())
  try {
    const response = await Promise.resolve(notificationService.getNotifications(filters))
    dispatch(
      fetchNotificationsSuccess({
        data: response.data,
        pagination: {
          total: response.total,
          offset: response.offset,
          limit: response.limit,
          hasMore: response.hasMore,
        },
        append,
      })
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notifications"
    dispatch(fetchNotificationsFailure(message))
  }
}

export const fetchUserNotifications = (userId: string) => async (dispatch: any) => {
  dispatch(fetchUserNotificationsStart())
  try {
    const response = await Promise.resolve(notificationService.getNotificationsByUserId(userId))
    dispatch(fetchUserNotificationsSuccess(response))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load user notifications"
    dispatch(fetchUserNotificationsFailure(message))
  }
}

export const fetchUserNotificationsAndMarkAsSeen = (userId: string) => async (dispatch: any) => {
  dispatch(fetchUserNotificationsStart())
  try {
    const response = await Promise.resolve(notificationService.getNotificationsAndMarkAsSeen(userId))
    dispatch(fetchUserNotificationsSuccess(response))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load and mark notifications"
    dispatch(fetchUserNotificationsFailure(message))
  }
}

export const fetchNotificationById = (id: string) => async (dispatch: any) => {
  dispatch(fetchNotificationByIdStart())
  try {
    const notification = await Promise.resolve(notificationService.getNotificationById(id))
    dispatch(fetchNotificationByIdSuccess(notification))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load notification"
    dispatch(fetchNotificationByIdFailure(message))
  }
}

export const createNotification = (data: CreateNotificationDTO) => async (dispatch: any) => {
  dispatch(createNotificationStart())
  try {
    const createdNotification = await Promise.resolve(notificationService.createNotification(data))
    dispatch(createNotificationSuccess(createdNotification))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create notification"
    dispatch(createNotificationFailure(message))
  }
}

export const updateNotification = (
  notificationId: string,
  updateData: UpdateNotificationDTO
) => async (dispatch: any) => {
  dispatch(updateNotificationStart())
  try {
    const response = await Promise.resolve(notificationService.updateNotification(notificationId, updateData))
    dispatch(updateNotificationSuccess(response))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notification"
    dispatch(updateNotificationFailure(message))
  }
}

export const markNotificationAsSeen = (notificationId: string) => async (dispatch: any) => {
  dispatch(markNotificationAsSeenStart())
  try {
    const response = await Promise.resolve(notificationService.markNotificationAsSeen(notificationId))
    dispatch(markNotificationAsSeenSuccess(response))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification as seen"
    dispatch(markNotificationAsSeenFailure(message))
  }
}

export const markAllNotificationsAsSeen = (userId: string) => async (dispatch: any) => {
  dispatch(markAllNotificationsAsSeenStart())
  try {
    await Promise.resolve(notificationService.markAllNotificationsAsSeen(userId))
    dispatch(markAllNotificationsAsSeenSuccess())
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark all notifications as seen"
    dispatch(markAllNotificationsAsSeenFailure(message))
  }
}

export const deleteNotification = (notificationId: string) => async (dispatch: any) => {
  dispatch(deleteNotificationStart())
  try {
    await Promise.resolve(notificationService.deleteNotification(notificationId))
    dispatch(deleteNotificationSuccess(notificationId))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete notification"
    dispatch(deleteNotificationFailure(message))
  }
}

export const markAsSeenOptimistic = (notificationId: string) => async (dispatch: any) => {
  dispatch(markAsSeenLocally(notificationId))
  
  try {
    await Promise.resolve(notificationService.markNotificationAsSeen(notificationId))
  } catch (error) {
    console.error("Failed to sync seen status with server:", error)
  }
}

export const markAllAsSeenOptimistic = (userId: string) => async (dispatch: any) => {
  dispatch(markAllAsSeenLocally(userId))
  
  try {
    await Promise.resolve(notificationService.markAllNotificationsAsSeen(userId))
  } catch (error) {
    console.error("Failed to sync seen status with server:", error)
  }
}
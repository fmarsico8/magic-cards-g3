"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Trash2, Check, CheckCheck } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchUserNotifications,
  markAsSeenOptimistic,
  markAllAsSeenOptimistic,
  clearError
} from "@/lib/notificationSlice"
import _ from "lodash"

interface NotificationCardProps {
  notification: any
  onMarkAsSeen: (id: string) => void
}

function NotificationCard({ notification, onMarkAsSeen }: NotificationCardProps) {
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "offer_created":
        return "📝"
      case "offer_accepted":
        return "✅"
      case "offer_rejected":
        return "❌"
      default:
        return "📬"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "offer_created":
        return "blue"
      case "offer_accepted":
        return "green"
      case "offer_rejected":
        return "red"
      default:
        return "gray"
    }
  }

  const handleNotificationClick = () => {
    if (!notification.seen) {
      onMarkAsSeen(notification.id)
    }
    // Navigate to the related offer
    if (notification.offerId) {
      router.push(`/offers/${notification.offerId}`)
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        !notification.seen ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
      }`}
      onClick={handleNotificationClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!notification.seen ? 'font-semibold' : ''}`}>
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline"
                  className={`text-xs bg-${getNotificationColor(notification.type)}-100 text-${getNotificationColor(notification.type)}-800`}
                >
                  {notification.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {!notification.seen && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsSeen(notification.id)
                }}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error 
  } = useAppSelector((state) => state.notifications)
  
  const { currentUser } = useAppSelector((state) => state.user)
  const userId = currentUser?.id

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserNotifications(userId))
    }
  }, [dispatch, userId])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleMarkAsSeen = (notificationId: string) => {
    dispatch(markAsSeenOptimistic(notificationId))
  }

  const handleMarkAllAsSeen = () => {
    if (userId) {
      dispatch(markAllAsSeenOptimistic(userId))
    }
  }

  const handleRefresh = () => {
    if (userId) {
      dispatch(fetchUserNotifications(userId))
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.seen
      case "read":
        return notification.seen
      default:
        return true
    }
  })

  if (isLoading && _.isEmpty(notifications)) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsSeen}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
          size="sm"
        >
          Unread ({notifications.filter(n => !n.seen).length})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
          size="sm"
        >
          Read ({notifications.filter(n => n.seen).length})
        </Button>
      </div>

      {/* Notifications list */}
      {_.isEmpty(filteredNotifications) ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {filter === "all" 
                ? "No notifications yet" 
                : filter === "unread" 
                ? "No unread notifications" 
                : "No read notifications"
              }
            </h2>
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "You'll see notifications about offers and other activities here." 
                : filter === "unread" 
                ? "All caught up! No new notifications." 
                : "No notifications have been read yet."
              }
            </p>
            {filter !== "all" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {_.map(filteredNotifications, (notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsSeen={handleMarkAsSeen}
            />
          ))}
        </div>
      )}
    </div>
  )
}

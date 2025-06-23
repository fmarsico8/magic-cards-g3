import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { NotificationService } from "../../application/services/NotificationService";
import { notificationRepository } from "../../infrastructure/provider/Container";

const router = Router();

// Initialize dependencies
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

// Create a new notification
router.post("/", (req, res) => notificationController.createNotification(req, res));

// Get notifications with filters
router.get("/", (req, res) => notificationController.getNotifications(req, res));

// Get notifications paginated
router.get("/paginated", (req, res) => notificationController.getNotificationsPaginated(req, res));

// Special endpoint: Get notifications and mark them as seen when accessed (must come before /user/:userId)
router.get("/user/:userId/seen", (req, res) => notificationController.getNotificationsAndMarkAsSeen(req, res));

// Get notifications by user ID
router.get("/user/:userId", (req, res) => notificationController.getNotificationsByUserId(req, res));

// Mark all notifications as seen for a user
router.patch("/user/:userId/seen", (req, res) => notificationController.markAllNotificationsAsSeen(req, res));

// Get notification by ID
router.get("/:id", (req, res) => notificationController.getNotificationById(req, res));

// Update notification
router.put("/:id", (req, res) => notificationController.updateNotification(req, res));

// Mark notification as seen
router.patch("/:id/seen", (req, res) => notificationController.markNotificationAsSeen(req, res));

// Delete notification
router.delete("/:id", (req, res) => notificationController.deleteNotification(req, res));

export default router;

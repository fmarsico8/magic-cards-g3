/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationType:
 *       type: string
 *       enum: [OFFER_CREATED, OFFER_ACCEPTED, OFFER_REJECTED]
 *       description: Type of notification
 *     
 *     CreateNotificationDTO:
 *       type: object
 *       required:
 *         - userId
 *         - message
 *         - offerId
 *         - type
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user who will receive the notification
 *         message:
 *           type: string
 *           description: Notification message
 *         offerId:
 *           type: string
 *           description: ID of the offer related to this notification
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *     
 *     UpdateNotificationDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Notification ID
 *         seen:
 *           type: boolean
 *           description: Whether the notification has been seen
 *     
 *     NotificationResponseDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Notification ID
 *         userId:
 *           type: string
 *           description: ID of the user who received the notification
 *         message:
 *           type: string
 *           description: Notification message
 *         offerId:
 *           type: string
 *           description: ID of the offer related to this notification
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *         seen:
 *           type: boolean
 *           description: Whether the notification has been seen
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was last updated
 *     
 *     NotificationFilterDTO:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: Filter by user ID
 *         seen:
 *           type: boolean
 *           description: Filter by seen status
 *         type:
 *           $ref: '#/components/schemas/NotificationType'
 *           description: Filter by notification type
 * 
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationDTO'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponseDTO'
 *       400:
 *         description: Bad request
 * 
 *   get:
 *     summary: Get notifications with filters
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: seen
 *         schema:
 *           type: boolean
 *         description: Filter by seen status
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/NotificationType'
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationResponseDTO'
 * 
 * /api/notifications/paginated:
 *   get:
 *     summary: Get notifications with pagination
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: seen
 *         schema:
 *           type: boolean
 *         description: Filter by seen status
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/NotificationType'
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationResponseDTO'
 *                 total:
 *                   type: integer
 *                   description: Total number of notifications
 *                 offset:
 *                   type: integer
 *                   description: Current offset
 *                 limit:
 *                   type: integer
 *                   description: Current limit
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more notifications
 * 
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponseDTO'
 *       404:
 *         description: Notification not found
 * 
 *   put:
 *     summary: Update notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationDTO'
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponseDTO'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Notification not found
 * 
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 * 
 * /api/notifications/{id}/seen:
 *   patch:
 *     summary: Mark notification as seen
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponseDTO'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Notification not found
 * 
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get notifications by user ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationResponseDTO'
 *       400:
 *         description: Bad request
 * 
 * /api/notifications/user/{userId}/seen:
 *   patch:
 *     summary: Mark all notifications as seen for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: All notifications marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as seen"
 *       400:
 *         description: Bad request
 * 
 *   get:
 *     summary: Get notifications by user ID and mark them as seen
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user notifications (all marked as seen)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationResponseDTO'
 *       400:
 *         description: Bad request
 */

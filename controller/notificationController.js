import Notification from "../models/notificationModel.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";

async function getNotification(req, res, next) {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId });
  if (notifications.length === 0) {
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: [] });
  }
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { notifications } });
}

async function oneNotificationIsRead(req, res, next) {
  const userId = req.user._id;
  const updateNotification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: userId },
    { $set: { isRead: true } },
    { new: true },
  );

  if (!updateNotification) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Notification is not found to read",
    });
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Notification is read",
    data: { updateNotification },
  });
}

async function allNotificationsIsRead(req, res, next) {
  const userId = req.user._id;
  const updateAllNotifications = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } },
  );
  if (updateAllNotifications.matchedCount == 0) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "No notifications found to update as read",
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "All notifications are updated to is read",
    data: { updateAllNotifications },
  });
}

async function deleteNotification(req, res, next) {
  const userId = req.user._id;
  const notificationId = req.params.id;

  const deleteOneNotification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!deleteOneNotification) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Notification is not found to delete",
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Notification deleted successfully",
  });
}

export default {
  getNotification: asyncWrapper(getNotification),
  oneNotificationIsRead: asyncWrapper(oneNotificationIsRead),
  allNotificationsIsRead: asyncWrapper(allNotificationsIsRead),
  deleteNotification: asyncWrapper(deleteNotification),
};

// utils/notifications.js
import admin from "./firebase.js";

export async function sendFCMNotification({ token, title, body, data }) {
  try {
    const message = {
      token,
      notification: { title, body },
      data,
    };

    const response = await admin.messaging().send(message);
    console.log("FCM notification sent:", response);
  } catch (error) {
    console.error("FCM notification error:", error.message);
  }
}


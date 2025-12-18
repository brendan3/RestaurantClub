import { storage } from "./storage";

/**
 * Push helper (STUB)
 *
 * This intentionally DOES NOT send real push notifications yet.
 * It only looks up registered device tokens and logs what would be sent.
 *
 * TODO: Integrate APNs / OneSignal / FCM here.
 */
export async function sendPushNotifications(params: {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  try {
    const { userIds, title, body, data } = params;
    if (!userIds || userIds.length === 0) return;

    const devices = await storage.getPushDevicesForUsers(userIds);
    if (!devices || devices.length === 0) return;

    const deviceTokens = devices.map((d) => d.deviceToken);
    console.log("[push] Would send push to", devices.length, "devices", {
      title,
      body,
      data,
      deviceTokens,
    });
  } catch (err) {
    console.error("[push] Failed to send push notifications (stub)", err);
    // swallow; never break callers
  }
}



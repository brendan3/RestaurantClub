# RestaurantClub

## Event recap photo uploads (Cloudinary)

Event recap photos are uploaded from the Event Detail “Photos” card to **Cloudinary**, and only small metadata is stored in Postgres (`event_photos` table).

### Required environment variables

Set these in **Railway** (backend) and in your local `.env` when running the server:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER` (optional, default: `restaurantclub/events`)

If Cloudinary is not configured, `POST /api/events/:id/photos` returns **501** with `{ "error": "Photo uploads not configured yet" }`.

## Native push notifications (iOS) — backend stub

The backend supports **registering device tokens** for native push notifications, but **does not send real pushes yet**.
Today it only logs what *would* be sent (see `server/push.ts`).

### Register a device token

`POST /api/push/devices` (auth required)

- **Request JSON**
  - `deviceToken`: string (required)
  - `platform`: `"ios" | "android" | "web"` (optional, defaults to `"ios"`)

- **Response**
  - `{ "success": true }`

### iOS (Capacitor/native) flow

- Request push permission from iOS
- Obtain an APNs device token
- Call `POST /api/push/devices` with:
  - `{ "deviceToken": "<apns-token>", "platform": "ios" }`

### Where to plug in real push sending

Replace the logging-only implementation in `server/push.ts` with APNs / OneSignal / FCM calls.

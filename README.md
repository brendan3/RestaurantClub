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

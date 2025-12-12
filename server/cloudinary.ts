import { v2 as cloudinary } from "cloudinary";

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_FOLDER,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("[Cloudinary] CLOUDINARY_* env vars not fully set. Uploads will be disabled.");
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryConfigured() {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export async function uploadEventImage(eventId: string, dataUrl: string) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary not configured");
  }

  const folder = CLOUDINARY_UPLOAD_FOLDER || "restaurantclub/events";
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `${folder}/${eventId}`,
    resource_type: "image",
  });

  return result.secure_url;
}



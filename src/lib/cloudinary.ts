import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_FOLDERS = {
  customerProfiles: "customers/profile",
  shipmentItems: "shipments/items",
  shipmentProof: "shipments/proof",
} as const;

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
}

export async function uploadImage(
  file: string,
  folder: (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS],
) {
  return configureCloudinary().uploader.upload(file, {
    folder,
    resource_type: "image",
  });
}

export async function deleteImage(publicId: string) {
  return configureCloudinary().uploader.destroy(publicId, {
    resource_type: "image",
  });
}

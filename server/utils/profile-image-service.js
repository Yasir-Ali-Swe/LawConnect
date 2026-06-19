import cloudinary from "../config/cloudinary.js";

export const uploadProfileImageToCloudinary = async ({ fileBuffer, userId }) => {
  const folder = `fyp/profile-images/${userId}`;

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      },
      (error, uploadResult) => {
        if (error) return reject(error);
        resolve(uploadResult);
      },
    );

    stream.end(fileBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const extractCloudinaryPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const marker = "/upload/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  let pathAfterUpload = url.substring(markerIndex + marker.length);

  // Strip version segment if present (e.g. v1712345678/)
  pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

  // Remove extension and query string
  pathAfterUpload = pathAfterUpload.split("?")[0].replace(/\.[^/.?]+$/, "");

  return pathAfterUpload || null;
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary delete failed:", error?.message || error);
  }
};

export const replaceProfileImage = async ({
  file,
  userId,
  existingUrl,
  existingPublicId,
}) => {
  if (!file) {
    return {
      profileImageUrl: existingUrl || null,
      profileImagePublicId:
        existingPublicId || extractCloudinaryPublicIdFromUrl(existingUrl),
    };
  }

  const previousPublicId =
    existingPublicId || extractCloudinaryPublicIdFromUrl(existingUrl);
  if (previousPublicId) {
    await deleteCloudinaryImage(previousPublicId);
  }

  const uploaded = await uploadProfileImageToCloudinary({
    fileBuffer: file.buffer,
    userId,
  });

  return {
    profileImageUrl: uploaded.url,
    profileImagePublicId: uploaded.publicId,
  };
};
/**
 * File uploads through Cloudinary's free plan (unsigned upload preset — no server needed).
 * Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET to enable.
 */
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const isUploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export const IMAGE_MAX_MB = 5;
export const DOCUMENT_MAX_MB = 10;

const DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Returns an error message, or "" when the file is acceptable. */
export const checkFile = (file, kind = "image") => {
  if (!file) return "Please choose a file.";
  if (kind === "image") {
    if (!file.type.startsWith("image/")) return "Please choose an image (JPG, PNG or WebP).";
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) return `Images must be under ${IMAGE_MAX_MB} MB.`;
  } else {
    if (!DOCUMENT_TYPES.includes(file.type)) return "Please choose a PDF or an image.";
    if (file.size > DOCUMENT_MAX_MB * 1024 * 1024) return `Files must be under ${DOCUMENT_MAX_MB} MB.`;
  }
  return "";
};

/**
 * Uploads a file and returns its public https URL.
 * `folder` keeps the Cloudinary media library organised (e.g. "alumnihub/photos").
 */
export const uploadFile = async (file, { folder = "alumnihub", kind = "image" } = {}) => {
  if (!isUploadConfigured) throw new Error("File uploads are not set up yet. Ask the administrator to add the Cloudinary keys.");
  const problem = checkFile(file, kind);
  if (problem) throw new Error(problem);

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);
  body.append("folder", folder);

  const resourceType = kind === "image" ? "image" : "auto";
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed. Please try again.");
  return data.secure_url;
};

/** Smaller, square version of a Cloudinary image for avatars (other URLs are returned unchanged). */
export const avatarUrl = (url, size = 256) =>
  url && url.includes("res.cloudinary.com") && url.includes("/image/upload/")
    ? url.replace("/image/upload/", `/image/upload/c_fill,g_face,w_${size},h_${size},f_auto,q_auto/`)
    : url;

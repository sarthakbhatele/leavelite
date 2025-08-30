
import { v2 as cloudinary } from "cloudinary";

// Server-side configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// For server-side uploads (admin operations)
export const uploadDocument = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "raw", // Use "raw" for documents instead of "auto"
      folder: "documents", // Organize files in a folder
      use_filename: true, // Preserve original filename
      unique_filename: false, // Keep original name (or set to true for unique names)
      ...options // Allow additional options to be passed
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalFilename: result.original_filename,
      format: result.format
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload document: ${error.message}`);
  }
};

// For client-side unsigned uploads - returns configuration
export const getUploadSignature = () => {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: "leavelite-pdf", // Your unsigned preset
    folder: "leave-applications"
  };
};

// Helper function to generate document URLs
export const getDocumentUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true
  });
};

// Helper function to delete documents
export const deleteDocument = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw"
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
};

// Generate PDF thumbnail URL (for preview purposes)
export const getPdfThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true,
    format: "jpg",
    page: 1, // First page of PDF
    width: 300,
    height: 400,
    crop: "fill"
  });
};
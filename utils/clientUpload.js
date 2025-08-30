// Client-side utility for Cloudinary uploads
export const uploadToCloudinary = async (file) => {
  try {
    // Get upload configuration from our API
    const configRes = await fetch('/api/cloudinary/signature');
    if (!configRes.ok) {
      throw new Error('Failed to get upload configuration');
    }
    
    const config = await configRes.json();
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', config.folder);
    
    // Upload to Cloudinary
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await uploadRes.json();
    return result.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload document: ${error.message}`);
  }
};

// Validate file before upload
export const validateFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.type.includes('pdf')) {
    errors.push('Please select a PDF file only.');
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

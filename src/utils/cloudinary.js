/**
 * Cloudinary Direct Unsigned Upload Utility
 */

export const uploadImageToCloudinary = async (file, cloudName, uploadPreset) => {
  if (!cloudName || !cloudName.trim()) {
    throw new Error('Cloudinary Cloud Name is required. Please set it in Admin Settings.');
  }
  if (!uploadPreset || !uploadPreset.trim()) {
    throw new Error('Cloudinary Upload Preset is required. Please set it in Admin Settings.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset.trim());
  formData.append('folder', 'unstop_portal');

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Upload failed with status code ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
};

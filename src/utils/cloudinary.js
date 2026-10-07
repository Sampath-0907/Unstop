/**
 * Helper to compress and resize large images before upload
 * Scales max dimension to 2560px and encodes to 88% quality JPEG,
 * compressing 10MB-50MB raw photos down to ~1.5MB without visual quality loss.
 */
const compressImageIfNeeded = async (file) => {
  // If not an image or if SVG/GIF, return as is
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already under 3.5MB, no need to compress
  if (file.size < 3.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Max dimension 2560px for Ultra-HD quality
        const MAX_DIMENSION = 2560;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG blob (0.88 quality preserves rich detail)
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.88
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

/**
 * Cloudinary Direct Unsigned Upload Utility with Auto-Compression
 */
export const uploadImageToCloudinary = async (file, cloudName, uploadPreset) => {
  if (!cloudName || !cloudName.trim()) {
    throw new Error('Cloudinary Cloud Name is required. Please set it in Admin Settings.');
  }
  if (!uploadPreset || !uploadPreset.trim()) {
    throw new Error('Cloudinary Upload Preset is required. Please set it in Admin Settings.');
  }

  // Automatically compress large files (e.g. >3.5MB or 13MB+ phone/DSLR raw shots)
  const fileToUpload = await compressImageIfNeeded(file);

  const formData = new FormData();
  formData.append('file', fileToUpload);
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

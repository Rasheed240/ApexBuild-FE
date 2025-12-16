import api from './api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

/**
 * Validate a file before upload
 * @param {File} file - The file to validate
 * @param {'image'|'video'|'document'} mediaType - Expected media type
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateMediaFile = (file, mediaType = 'image') => {
  if (!file) return { valid: false, error: 'No file provided' };

  if (mediaType === 'image') {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File must be a JPEG, PNG, GIF, or WebP image' };
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB` };
    }
  } else if (mediaType === 'video') {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'File must be an MP4, WebM, or OGG video' };
    }
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `Video must be smaller than ${MAX_VIDEO_SIZE_MB}MB` };
    }
  }

  return { valid: true };
};

/**
 * Upload profile picture for the current user
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data || response.data;
};

/**
 * Upload organization logo
 * @param {string} organizationId - The organization ID
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadOrganizationLogo = async (organizationId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/media/organization-logo/${organizationId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data || response.data;
};

/**
 * Upload media for a project
 * @param {string} projectId - The project ID
 * @param {File} file - The file to upload
 * @param {string} mediaType - Type of media ('image', 'video', 'document')
 * @returns {Promise<{url: string, publicId: string, mediaType: string}>}
 */
export const uploadProjectMedia = async (projectId, file, mediaType = 'image') => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/media/project/${projectId}?mediaType=${mediaType}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data || response.data;
};

/**
 * Upload media for a task
 * @param {string} taskId - The task ID
 * @param {File} file - The file to upload
 * @param {string} mediaType - Type of media ('image', 'video', 'document')
 * @returns {Promise<{url: string, publicId: string, mediaType: string}>}
 */
export const uploadTaskMedia = async (taskId, file, mediaType = 'image') => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/media/task/${taskId}?mediaType=${mediaType}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data || response.data;
};

/**
 * Delete media by public ID
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} resourceType - Type of resource ('image', 'video', 'raw')
 * @returns {Promise<boolean>}
 */
export const deleteMedia = async (publicId, resourceType = 'image') => {
  const response = await api.delete(`/media/${publicId}?resourceType=${resourceType}`);
  return response.data?.success || false;
};

export default {
  uploadProfilePicture,
  uploadOrganizationLogo,
  uploadProjectMedia,
  uploadTaskMedia,
  deleteMedia,
};

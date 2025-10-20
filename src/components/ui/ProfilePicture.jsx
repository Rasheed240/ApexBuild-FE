import { useState, useEffect } from 'react';
import { Camera, User, Loader } from 'lucide-react';

export function ProfilePicture({
  src,
  alt = 'Profile',
  size = 'md',
  editable = false,
  onUpload,
  className = '',
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(src);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreview(src);
  }, [src]);

  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for profile pictures)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Call upload handler
      if (onUpload) {
        const result = await onUpload(file);
        if (result?.url) {
          setPreview(result.url);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setPreview(src);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg`}
      >
        {uploading ? (
          <Loader className={`${iconSizes[size]} text-white animate-spin`} />
        ) : preview ? (
          <img
            src={preview}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-white`} />
        )}
      </div>

      {editable && !uploading && (
        <label
          htmlFor="profile-upload"
          className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
        >
          <Camera className="h-4 w-4" />
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="absolute top-full mt-2 text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}

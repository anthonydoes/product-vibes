// File validation utilities for uploads

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export class FileValidator {
  // Maximum file sizes
  static readonly MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
  static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  static readonly MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB for avatars
  static readonly MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB for all files

  // Allowed file types
  static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/mov'
  ];

  /**
   * Validate a logo file
   */
  static validateLogo(file: File): FileValidationResult {
    // Check file type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Logo must be a valid image file (JPEG, PNG, WebP, or GIF)'
      };
    }

    // Check file size
    if (file.size > this.MAX_LOGO_SIZE) {
      return {
        isValid: false,
        error: `Logo file size must be less than ${this.formatFileSize(this.MAX_LOGO_SIZE)}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate product images/videos
   */
  static validateProductMedia(files: File[]): FileValidationResult {
    // Check number of files
    if (files.length > 5) {
      return {
        isValid: false,
        error: 'Maximum 5 files allowed for product media'
      };
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.MAX_TOTAL_SIZE) {
      return {
        isValid: false,
        error: `Total file size must be less than ${this.formatFileSize(this.MAX_TOTAL_SIZE)}`
      };
    }

    // Check each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      const isValidImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
      const isValidVideo = this.ALLOWED_VIDEO_TYPES.includes(file.type);
      
      if (!isValidImage && !isValidVideo) {
        return {
          isValid: false,
          error: `File "${file.name}" must be a valid image or video file`
        };
      }

      // Check individual file size
      if (file.size > this.MAX_IMAGE_SIZE) {
        return {
          isValid: false,
          error: `File "${file.name}" must be less than ${this.formatFileSize(this.MAX_IMAGE_SIZE)}`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate an avatar file
   */
  static validateAvatar(file: File): FileValidationResult {
    // Check file type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Avatar must be a valid image file (JPEG, PNG, WebP, or GIF)'
      };
    }

    // Check file size
    if (file.size > this.MAX_AVATAR_SIZE) {
      return {
        isValid: false,
        error: `Avatar file size must be less than ${this.formatFileSize(this.MAX_AVATAR_SIZE)}`
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file is an image
   */
  static isImage(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * Check if file is a video
   */
  static isVideo(file: File): boolean {
    return this.ALLOWED_VIDEO_TYPES.includes(file.type);
  }
}

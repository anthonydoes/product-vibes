import { supabase } from '../lib/supabase'

export class StorageService {
  private static BUCKET_NAME = 'product-assets'

  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param folder - The folder within the bucket (e.g., 'logos', 'products')
   * @param fileName - Optional custom filename
   * @returns Promise with the public URL or error
   */
  static async uploadFile(
    file: File, 
    folder: string, 
    fileName?: string
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Generate unique filename if not provided
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileExtension = file.name.split('.').pop()
      const finalFileName = fileName || `${timestamp}_${randomString}.${fileExtension}`
      
      // Create the full path
      const filePath = `${folder}/${finalFileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        })

      if (error) {
        console.error('Upload error:', error)
        return { url: null, error }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Storage service error:', error)
      return { url: null, error: error as Error }
    }
  }

  /**
   * Upload multiple files
   * @param files - Array of files to upload
   * @param folder - The folder within the bucket
   * @returns Promise with array of URLs or errors
   */
  static async uploadMultipleFiles(
    files: File[], 
    folder: string
  ): Promise<{ urls: string[]; errors: Error[] }> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder))
    const results = await Promise.all(uploadPromises)
    
    const urls: string[] = []
    const errors: Error[] = []
    
    results.forEach(result => {
      if (result.url) {
        urls.push(result.url)
      }
      if (result.error) {
        errors.push(result.error)
      }
    })
    
    return { urls, errors }
  }

  /**
   * Delete a file from storage
   * @param filePath - The full path of the file to delete
   * @returns Promise with success/error status
   */
  static async deleteFile(filePath: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  /**
   * Get public URL for a file
   * @param filePath - The path of the file in storage
   * @returns The public URL
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  /**
   * Extract file path from a public URL
   * @param url - The public URL
   * @returns The file path within the bucket
   */
  static extractFilePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${this.BUCKET_NAME}/`)
      return urlParts[1] || null
    } catch {
      return null
    }
  }

  /**
   * Upload an avatar file for a user
   * @param file - The avatar file to upload
   * @param userId - The user ID for the avatar
   * @returns Promise with the public URL or error
   */
  static async uploadAvatar(
    file: File, 
    userId: string
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      // Generate unique filename for avatar
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`
      
      // Create the full path in avatars folder
      const filePath = `avatars/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting user's previous avatar
        })

      if (error) {
        console.error('Avatar upload error:', error)
        return { url: null, error }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Avatar upload error:', error)
      return { url: null, error: error as Error }
    }
  }
}

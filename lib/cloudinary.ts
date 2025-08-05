import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Helper function for uploading images
export const uploadImage = async (file: File | string, folder?: string) => {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: folder || 'jooka-ecommerce',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

// Helper function for deleting images
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // remove the locally saved temporary file as the file has been uploaded successfully
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath)
    return null
  }
}

const deleteFromCloudinary = async (fileUrl, resource_type) => {
  try {
    const publicId = extractPublicIdFromUrl(fileUrl)
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type
    })
    return response
  } catch (error) {
    return null
  }
}

function extractPublicIdFromUrl(url) {
  const parts = url.split('/')
  const publicIdWithFormat = parts[parts.length - 1] // last part of the URL
  const publicId = publicIdWithFormat.split('.')[0] // remove the file format extension
  return publicId
}

export { 
  uploadOnCloudinary,
  deleteFromCloudinary
}

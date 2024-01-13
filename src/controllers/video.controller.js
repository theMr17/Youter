import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    
    if (!title) {
        throw new ApiError(400, "Title is required")
    }

    if (!description) {
        throw new ApiError(400, "Description is required")
    }

    if (!Array.isArray(req.files.videoFile)) {
        throw new ApiError(400, "Video file is required")
    }

    if (!Array.isArray(req.files.thumbnail)) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    const video = await uploadOnCloudinary(videoLocalPath)

    if (!video.url) {
        throw new ApiError(500, "Error while uploading video on cloudinary")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail.url) {
        throw new ApiError(500, "Error while uploading thumbnail on cloudinary")
    }

    const publishedVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: req.user?._id
    })

    if (!publishedVideo) {
        throw new ApiError(500, "Error while publishing the video")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                publishedVideo,
                "Video published successfully"
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    
    if (!title && !description && !req.file) {
        throw new ApiError(400, "Title, description or thumnail is required")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const video = await Video.findById(videoId)

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "User is not authorized to update the video")
    }

    const thumbnailLocalPath = req.file?.path
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    await deleteFromCloudinary(video.thumbnail, "image")

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail?.url || video.url
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "Video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }
    
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "User is not authorized to delete the video")
    }

    await deleteFromCloudinary(video.videoFile, "video")
    await deleteFromCloudinary(video.thumbnail, "image")

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(500, "Error while deleting the video")
    }

    return res.
        status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }
    
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "User is not authorized to toggle publish status")
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: !video.isPublished },
                `Video ${video.isPublished ? "un" : ""}published`
            )
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

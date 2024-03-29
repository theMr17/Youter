import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }
    
    const like = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    let isLiked, message

    if (!like?.length) {
        await Like.create({
            likedBy: req.user?._id,
            video: videoId
        })
        isLiked = true
        message = "Like added"
    } else {
        await Like.findByIdAndDelete(like[0]._id)
        isLiked = false
        message = "Like removed"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked },
                message
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    // TODO: toggle like on comment
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    
    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }
    
    const like = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                tweet: new mongoose.Types.ObjectId(tweetId)
            }
        }
    ])

    let isLiked, message

    if (!like?.length) {
        await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })
        isLiked = true
        message = "Like added"
    } else {
        await Like.findByIdAndDelete(like[0]._id)
        isLiked = false
        message = "Like removed"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked },
                message
            )
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {
                    $ne: null
                }
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

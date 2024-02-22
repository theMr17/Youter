import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    // TODO: get all comments for a video
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    if (!content) {
        throw new ApiError("Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Error while creating the comment")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                comment,
                "Comment created successfully"
            )
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}

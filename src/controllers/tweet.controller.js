import mongoose from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content) {
        throw new ApiError("Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweet,
                "Tweet created successfully"
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "Tweets fetched successfully"
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    if (!content) {
        throw new ApiError("Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId),
                owner: new mongoose.Types.ObjectId(req.user?._id)
            },
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(400, "User not authorized to update the tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "Tweet updated successfully"
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

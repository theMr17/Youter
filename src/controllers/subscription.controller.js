import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel id is required")
    }

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id is invalid")
    }
    
    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(req.user._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    let isSubscribed, message

    if (!subscription?.length) {
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        isSubscribed = true
        message = "Subscription added"
    } else {
        await Subscription.findByIdAndDelete(subscription[0]._id)
        isSubscribed = false
        message = "Subscription removed"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isSubscribed },
                message
            )
        )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel id is required")
    }

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id is invalid")
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscriptions,
                "Subscribers fetched successfully"
            )
        )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber id is required")
    }

    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Subscriber id is invalid")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels fetched successfully"
            )
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

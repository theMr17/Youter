import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel Id is required")
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
    // TODO: get subscriber list of a channel
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // TODO: get channel list to which user has subscribed
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}

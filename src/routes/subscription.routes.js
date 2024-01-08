import { Router } from 'express'
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJwt)

router
    .route("/channel/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription)

router.route("/user/:subscriberId").get(getSubscribedChannels)

export default router

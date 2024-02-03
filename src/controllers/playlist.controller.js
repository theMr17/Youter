import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    
    if (!name) {
        throw new ApiError(400, "Name is required")
    }

    if (!description) {
        throw new ApiError(400, "Description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(500, "An error occurred while creating the playlist")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                playlist,
                "Playlist created successfully"
            )
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    
    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }

    const playlists = await Playlist.aggregate([
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
                playlists,
                "Playlists fetched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist fetched successfully"
            )
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    if (!playlist.videos.includes(videoId))
        playlist.videos.push(videoId)

    const updatedPlaylist = await playlist.save({ validateBeforeSave: false })

    if (!updatedPlaylist) {
        throw new ApiError(500, "Error while updating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    playlist.videos.remove(videoId)

    const updatedPlaylist = await playlist.save({ validateBeforeSave: false })

    if (!updatedPlaylist) {
        throw new ApiError(500, "Error while updating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(403, "User is not authorized to delete the playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(500, "Error while deleting the playlist")
    }

    return res.
        status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Playlist deleted successfully"
            )
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!name && !description) {
        throw new ApiError(400, "Name or description is required")
    }

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is invalid")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(403, "User is not authorized to update the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.title,
                description: description || playlist.description,
            }
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Error while updating the playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

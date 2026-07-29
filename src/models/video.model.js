import mongoose from "mongoose";
import { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary video URL
            required: true
        },

        thumbnail: {
            type: String, // Cloudinary thumbnail URL
            required: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Video = mongoose.model("Video", videoSchema);
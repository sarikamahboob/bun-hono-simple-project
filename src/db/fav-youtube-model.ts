import { Schema, model } from "mongoose";

export interface IFavYoutubeVideoSchema {
    title: string;
    description: string;
    thumbnailUrl?: string;
    watched: boolean;
    youtuberName: string;
}

const FavYoutubeVideoSchema = new Schema<IFavYoutubeVideoSchema>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: false,
        default: ""
    },
    watched: {
        type: Boolean,
        default: false,
        required: true
    },
    youtuberName: {
        type: String,
        required: true
    },
})

const FavYoutubeVideoModel = model("fav-youtube-vdieo", FavYoutubeVideoSchema)

export default FavYoutubeVideoModel;
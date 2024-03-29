const mongoose = require("mongoose");
const { landmarkSchema } = require("../schemas");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const LandmarkSchema = new Schema(
    {
        title: String,
        description: String,
        location: String,
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        images: [ImageSchema],
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },
    { toJSON: { virtuals: true } }
);

LandmarkSchema.virtual("properties.popUpHTML").get(function () {
    return `<a href='/landmarks/${this._id}'>${this.title}</a><br>${this.location}`;
});

//Mongo middleware to delete
LandmarkSchema.post("findOneAndDelete", async function (landmark) {
    if (landmark) {
        await Review.deleteMany({ _id: { $in: landmark.reviews } });
    }
});

module.exports = mongoose.model("Landmark", LandmarkSchema);

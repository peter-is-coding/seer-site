const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
const { reviewSchema } = require("../schemas");
const Landmark = require("../models/landmark");
const Review = require("../models/review");

const validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        const err = result.error.details.map((e) => e.message).join(";");
        throw new ExpressError(err, 400);
    } else {
        next();
    }
};

router.post(
    "/",
    validateReview,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.id);
        const review = new Review(req.body.review);
        landmark.reviews.push(review);
        await review.save();
        await landmark.save();
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

router.delete(
    "/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Landmark.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/landmarks/${id}`);
    })
);

module.exports = router;

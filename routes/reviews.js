const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
const { reviewSchema } = require("../schemas");
const { forceLogin, validateReview } = require("../util/middleware");
const Landmark = require("../models/landmark");
const Review = require("../models/review");

router.post(
    "/",
    validateReview,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.id);
        const review = new Review(req.body.review);
        landmark.reviews.push(review);
        await review.save();
        await landmark.save();
        req.flash("success", "Thanks for submitting a review.");
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

router.delete(
    "/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Landmark.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review deleted.");
        res.redirect(`/landmarks/${id}`);
    })
);

module.exports = router;

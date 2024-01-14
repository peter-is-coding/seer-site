const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
const {
    forceLogin,
    checkReviewPermissions,
    validateReview,
} = require("../util/middleware");
const Landmark = require("../models/landmark");
const Review = require("../models/review");

router.get("/", (req, res) => {
    res.redirect(`/landmarks/${req.params.lmid}`);
});

router.post(
    "/",
    forceLogin,
    validateReview,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.lmid);
        const review = new Review(req.body.review);
        review.creator = req.user._id;
        landmark.reviews.push(review);
        await review.save();
        await landmark.save();
        req.flash("success", "Thanks for submitting a review.");
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

router.delete(
    "/:rvid",
    forceLogin,
    checkReviewPermissions,
    catchAsync(async (req, res) => {
        const { lmid, rvid } = req.params;
        await Landmark.findByIdAndUpdate(lmid, { $pull: { reviews: rvid } });
        await Review.findByIdAndDelete(rvid);
        req.flash("success", "Review deleted.");
        res.redirect(`/landmarks/${lmid}`);
    })
);

module.exports = router;

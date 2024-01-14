const Landmark = require("../models/landmark");
const Review = require("../models/review");
const catchAsync = require("../util/catchAsync");

module.exports.index = (req, res) => {
    res.redirect(`/landmarks/${req.params.lmid}`);
};

module.exports.create = catchAsync(async (req, res) => {
    const landmark = await Landmark.findById(req.params.lmid);
    const review = new Review(req.body.review);
    review.creator = req.user._id;
    landmark.reviews.push(review);
    await review.save();
    await landmark.save();
    req.flash("success", "Thanks for submitting a review.");
    res.redirect(`/landmarks/${landmark._id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
    const { lmid, rvid } = req.params;
    await Landmark.findByIdAndUpdate(lmid, { $pull: { reviews: rvid } });
    await Review.findByIdAndDelete(rvid);
    req.flash("success", "Review deleted.");
    res.redirect(`/landmarks/${lmid}`);
});

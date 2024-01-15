const Landmark = require("../models/landmark");
const Review = require("../models/review");
const ExpressError = require("./ExpressError");
const { landmarkSchema, reviewSchema } = require("../schemas");

module.exports.setFlashes = (req, res, next) => {
    res.locals.msgSuccess = req.flash("success");
    res.locals.msgError = req.flash("error");
    next();
};

module.exports.setUserDetails = (req, res, next) => {
    res.locals.currentUser = req.user;
    next();
};

module.exports.forceLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.method.toUpperCase() === "GET") {
            req.session.returnPath = req.originalUrl;
        } else {
            req.session.returnPath = null;
        }
        req.flash("error", "Please sign in.");
        res.redirect("/login");
    } else {
        next();
    }
};

module.exports.checkLandmarkPermissions = async (req, res, next) => {
    const landmark = await Landmark.findById(req.params.lmid).populate(
        "creator"
    );

    if (!landmark) {
        req.flash("error", "Landmark ID not found.");
        return res.render("landmarks", { landmark });
    }
    if (!landmark.creator.equals(req.user)) {
        req.flash(
            "error",
            "You do not have permission to update that landmark."
        );
        return res.redirect(`/landmarks/${landmark._id}`);
    }
    next();
};

module.exports.checkReviewPermissions = async (req, res, next) => {
    const review = await Review.findById(req.params.rvid).populate("creator");
    if (!review) {
        req.flash("error", "Review ID not found.");
        return res.redirect(`/landmarks/${req.params.lmid}`);
    }
    if (!review.creator.equals(req.user)) {
        req.flash("error", "You do not have permission to update that review.");
        return res.redirect(`/landmarks/${req.params.lmid}`);
    }
    next();
};

//Middleware required to store this value as session is cleared on login by passport.
module.exports.storeReturnPath = (req, res, next) => {
    if (req.session.returnPath) res.locals.returnPath = req.session.returnPath;
    next();
};

module.exports.validateLandmark = (req, res, next) => {
    const result = landmarkSchema.validate(req.body);
    if (result.error) {
        const err = result.error.details.map((e) => e.message).join(";");
        throw new ExpressError(err, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        const err = result.error.details.map((e) => e.message).join(";");
        throw new ExpressError(err, 400);
    } else {
        next();
    }
};

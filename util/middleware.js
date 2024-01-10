module.exports.setFlashes = (req, res, next) => {
    res.locals.msgSuccess = req.flash("success");
    res.locals.msgError = req.flash("error");
    next();
};

module.exports.forceLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please sign in.");
        res.redirect("/login");
    } else {
        next();
    }
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

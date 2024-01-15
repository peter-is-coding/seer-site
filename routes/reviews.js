const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const {
    forceLogin,
    checkReviewPermissions,
    validateReview,
} = require("../util/middleware");

router
    .route("/")
    .get(reviews.index)
    .post(forceLogin, validateReview, reviews.create);

router.delete("/:rvid", forceLogin, checkReviewPermissions, reviews.delete);

module.exports = router;

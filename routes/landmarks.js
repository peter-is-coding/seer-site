const express = require("express");
const router = express.Router();
const landmarks = require("../controllers/landmarks");

const {
    forceLogin,
    checkLandmarkPermissions,
    validateLandmark,
} = require("../util/middleware");

router
    .route("/")
    .get(landmarks.index)
    .post(forceLogin, validateLandmark, landmarks.create);

router.get("/new", forceLogin, landmarks.new);

router
    .route("/:lmid")
    .get(landmarks.get)
    .delete(forceLogin, checkLandmarkPermissions, landmarks.delete);

router
    .route("/:lmid/edit")
    .get(forceLogin, checkLandmarkPermissions, landmarks.getEditForm)
    .patch(
        forceLogin,
        checkLandmarkPermissions,
        validateLandmark,
        landmarks.update
    );

module.exports = router;
